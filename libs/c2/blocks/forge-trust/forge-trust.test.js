// L22 test fixture for the authored Milo block forge-trust.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// Each it() loads the network-free (data-URI) fixture itself — no shared hook.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-trust.js';

describe('forge-trust', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('rebuilds the head, grid and one tile per picture from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    // Reconstruction is gated, not assumed: head present, grid present, and
    // exactly N tiles for the 3 pictures (the empty-grid regression fails here).
    expect(block.dataset.forgeAuthored).to.equal('forge-trust');
    expect(block.querySelector('.section-inner .trust-head'), 'head').to.exist;
    const tiles = block.querySelectorAll('.trust-grid > .etile');
    expect(tiles.length, 'one tile per picture').to.equal(3);
    expect(block.querySelectorAll('.etile .etile-img img').length, 'cover image per tile').to.equal(3);
    expect(block.querySelectorAll('.etile .etile-type h3').length, 'heading per tile').to.equal(3);
  });
});
