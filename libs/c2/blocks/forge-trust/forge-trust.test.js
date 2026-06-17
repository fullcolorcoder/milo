// L22 fixture for the authored Milo C2 block forge-trust.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// The mock body is the REAL class-less DA serialization (flat <p>/<h2>/<picture>/
// <h3>/<p> run) — the test asserts init() RECONSTRUCTS the trust layout from it.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-trust.js';

describe('forge-trust', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the trust tile layout from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    // Forge marker + section analytics handle.
    expect(block.dataset.forgeAuthored).to.equal('forge-trust');
    expect(block.getAttribute('daa-lh')).to.equal('forge-trust');

    // Rebuilt structure: one section-inner, one header group, one tiles row.
    expect(block.querySelectorAll('.section-inner').length).to.equal(1);
    expect(block.querySelectorAll('.trust-head').length).to.equal(1);
    expect(block.querySelectorAll('.trust-tiles').length).to.equal(1);

    // Header carries the eyebrow + the single title (h2, never an h1).
    expect(block.querySelector('.trust-head .trust-eyebrow')).to.exist;
    expect(block.querySelector('.trust-head .trust-title')).to.exist;
    expect(block.querySelectorAll('h1').length).to.equal(0);

    // Three media tiles, each with a moved <picture> and a caption.
    expect(block.querySelectorAll('.trust-tiles .trust-tile').length).to.equal(3);
    expect(block.querySelectorAll('.trust-tile .trust-tile-img picture').length).to.equal(3);
    expect(block.querySelectorAll('.trust-tile-cap .trust-heading').length).to.equal(3);
    expect(block.querySelectorAll('.trust-tile-cap .trust-body').length).to.equal(3);

    // <picture> moved (not cloned): authored lazy-load attribute preserved.
    const img = block.querySelector('.trust-tile-img img');
    expect(img.getAttribute('loading')).to.equal('lazy');
  });
});
