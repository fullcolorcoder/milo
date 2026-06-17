// L22 fixture for the authored Milo C2 block forge-use-case-6.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// The mock body is the REAL class-less DA serialization (flat <h2>/<picture>/
// <h3>/<p> run) — the test asserts init() RECONSTRUCTS the bento layout from it.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-use-case-6.js';

describe('forge-use-case-6', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the [2-up, full, 2-up] bento layout from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-use-case-6');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    // Forge marker + section analytics handle.
    expect(block.dataset.forgeAuthored).to.equal('forge-use-case-6');
    expect(block.getAttribute('daa-lh')).to.equal('forge-use-case-6');

    // Rebuilt structure: one section-inner, one grid, 3 rows (2-up + full + 2-up).
    expect(block.querySelectorAll('.section-inner').length).to.equal(1);
    expect(block.querySelectorAll('.uc-grid').length).to.equal(1);
    expect(block.querySelectorAll('.uc-row').length).to.equal(3);
    expect(block.querySelectorAll('.uc-row-full').length).to.equal(1);

    // Five media tiles total; the wide one becomes the full-width tile.
    expect(block.querySelectorAll('.bento').length).to.equal(5);
    expect(block.querySelectorAll('.bento-full').length).to.equal(1);
    expect(block.querySelectorAll('.bento .bento-img picture').length).to.equal(5);

    // The full-width tile sits on its own row, between the two 2-up rows.
    const fullRow = block.querySelector('.uc-row-full');
    expect(fullRow.querySelectorAll('.bento').length).to.equal(1);
    const rows = [...block.querySelectorAll('.uc-row')];
    expect(rows.indexOf(fullRow)).to.equal(1);

    // The full-width tile's caption is screen-reader-only.
    expect(block.querySelectorAll('.bento-cap-vh').length).to.equal(1);

    // Headings/body promoted; title survives as a single heading.
    expect(block.querySelectorAll('.bento-cap .bento-heading').length).to.equal(5);
    expect(block.querySelectorAll('.bento-cap .bento-body').length).to.equal(5);
    expect(block.querySelectorAll('h1').length).to.be.at.most(1);
    expect(block.querySelector('.uc-title')).to.exist;

    // <picture> moved (not cloned): authored lazy-load attribute preserved.
    const img = block.querySelector('.bento-img img');
    expect(img.getAttribute('loading')).to.equal('lazy');
  });
});
