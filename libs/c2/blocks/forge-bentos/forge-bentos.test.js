// L22 fixture for the authored Milo C2 block forge-bentos.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// The mock body is the REAL class-less DA serialization (flat <h2>/<picture>/
// <h3>/<p> run) — the test asserts init() RECONSTRUCTS the bento grid from it.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-bentos.js';

describe('forge-bentos', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the bento grid from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-bentos');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    // Forge marker + section analytics handle.
    expect(block.dataset.forgeAuthored).to.equal('forge-bentos');
    expect(block.getAttribute('daa-lh')).to.equal('forge-bentos');

    // Rebuilt structure: one section-inner, one grid, 2 rows of 2 tiles = 4.
    expect(block.querySelectorAll('.section-inner').length).to.equal(1);
    expect(block.querySelectorAll('.bento-grid').length).to.equal(1);
    expect(block.querySelectorAll('.bento-row').length).to.equal(2);
    expect(block.querySelectorAll('.bento').length).to.equal(4);

    // Each tile carries its media + caption; the title survives as a single h1/h2.
    expect(block.querySelectorAll('.bento .bento-img picture').length).to.equal(4);
    expect(block.querySelectorAll('.bento .bento-cap .bento-heading').length).to.equal(4);
    expect(block.querySelectorAll('.bento .bento-cap .bento-body').length).to.equal(4);
    expect(block.querySelectorAll('h1').length).to.be.at.most(1);
    expect(block.querySelector('.title')).to.exist;

    // <picture> moved (not cloned): authored lazy-load attribute preserved.
    const img = block.querySelector('.bento-img img');
    expect(img.getAttribute('loading')).to.equal('lazy');
  });
});
