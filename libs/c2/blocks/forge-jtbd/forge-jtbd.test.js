// Reconstruction fixture for the authored Milo block forge-jtbd.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// The mock mirrors the REAL class-less DA serialization (flat h2/h3/p/picture in
// document order) — so these assertions gate that decorate() REBUILT the bento.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-jtbd.js';

describe('forge-jtbd', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('rebuilds the capability bento from the flat DA cell', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jtbd');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    // analytics + marker
    expect(block.getAttribute('daa-lh')).to.equal('forge-jtbd');
    expect(block.dataset.forgeAuthored).to.equal('forge-jtbd');

    // head reconstructed (eyebrow + single title + sub)
    const head = block.querySelector('.forge-jtbd-head');
    expect(head, 'head rebuilt').to.exist;
    expect(head.querySelector('.forge-jtbd-eyebrow'), 'eyebrow').to.exist;
    expect(head.querySelector('.forge-jtbd-title'), 'title').to.exist;
    expect(head.querySelector('.forge-jtbd-sub'), 'sub').to.exist;
    expect(block.querySelectorAll('h1').length, 'no h1 (L8)').to.equal(0);

    // grid + rows + cards reconstructed (classes stamped by decorate, not DA)
    const grid = block.querySelector('.forge-jtbd-grid');
    expect(grid, 'grid container rebuilt').to.exist;
    expect(grid.querySelectorAll('.forge-jtbd-row').length, '3 rows').to.equal(3);
    expect(grid.querySelectorAll('.forge-jtbd-card').length, '6 cards').to.equal(6);

    // card variants: first feature, last overlay, second-to-last narrow
    expect(block.querySelectorAll('.forge-jtbd-card--feature').length, 'one feature card').to.equal(1);
    expect(block.querySelectorAll('.forge-jtbd-card--overlay').length, 'one overlay card').to.equal(1);
    expect(block.querySelectorAll('.forge-jtbd-card--narrow').length, 'one narrow card').to.equal(1);

    // every card carries a media wrapper + a copy wrapper
    expect(block.querySelectorAll('.forge-jtbd-media').length, '6 media wrappers').to.equal(6);
    expect(block.querySelectorAll('.forge-jtbd-copy').length, '6 copy wrappers').to.equal(6);

    // media preserved (move, not serialize) + analytics flagged
    const imgs = block.querySelectorAll('.forge-jtbd-media img');
    expect(imgs.length, '6 images preserved').to.equal(6);
    imgs.forEach((img) => {
      expect(img.getAttribute('loading')).to.equal('lazy');
      expect(img.getAttribute('daa-im')).to.equal('true');
    });
  });
});
