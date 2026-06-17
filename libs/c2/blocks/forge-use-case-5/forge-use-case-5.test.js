// L22 fixture for the authored Milo C2 block forge-use-case-5.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// The mock body is the REAL class-less DA serialization (flat <h2>/<picture>/
// <h3>/<p> run) — the test asserts init() RECONSTRUCTS the 2x2 bento layout.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-use-case-5.js';

describe('forge-use-case-5', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the 2x2 bento use-case layout from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-use-case-5');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    // Forge marker + section analytics handle.
    expect(block.dataset.forgeAuthored).to.equal('forge-use-case-5');
    expect(block.getAttribute('daa-lh')).to.equal('forge-use-case-5');

    // Rebuilt structure: one section-inner, one grid, 2 rows of 2 tiles each.
    expect(block.querySelectorAll('.section-inner').length).to.equal(1);
    expect(block.querySelectorAll('.uc-grid').length).to.equal(1);
    expect(block.querySelectorAll('.uc-row').length).to.equal(2);

    // Four media tiles total — a clean 2x2 grid.
    expect(block.querySelectorAll('.bento').length).to.equal(4);
    expect(block.querySelectorAll('.bento .bento-img picture').length).to.equal(4);

    // Headings/body promoted; title survives as a single h2 with no h1.
    expect(block.querySelectorAll('.bento-cap .bento-heading').length).to.equal(4);
    expect(block.querySelectorAll('.bento-cap .bento-body').length).to.equal(4);
    expect(block.querySelectorAll('h1').length).to.be.at.most(1);
    expect(block.querySelector('.uc-title')).to.exist;

    // <picture> moved (not cloned): authored lazy-load attribute preserved.
    const img = block.querySelector('.bento-img img');
    expect(img.getAttribute('loading')).to.equal('lazy');
  });
});
