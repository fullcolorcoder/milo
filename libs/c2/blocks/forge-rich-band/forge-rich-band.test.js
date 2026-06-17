// L22 fixture for the authored Milo C2 block forge-rich-band.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// The mock body is the REAL class-less DA serialization (flat <picture>/<picture>/
// text/<h2> run) — the test asserts init() RECONSTRUCTS the rich band from it.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-rich-band.js';

describe('forge-rich-band', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the rich band from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-rich-band');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    // Forge marker + section analytics handle.
    expect(block.dataset.forgeAuthored).to.equal('forge-rich-band');
    expect(block.getAttribute('daa-lh')).to.equal('forge-rich-band');

    // Rebuilt structure: background, scrim, and the lower-left content stack.
    expect(block.querySelectorAll('.bg').length).to.equal(1);
    expect(block.querySelectorAll('.scrim').length).to.equal(1);
    expect(block.querySelectorAll('.section-inner').length).to.equal(1);
    expect(block.querySelectorAll('.rb-inner .rb-top').length).to.equal(1);

    // App-id row: the small mnemonic picture + the eyebrow label.
    expect(block.querySelectorAll('.rb-top .app-id .cc').length).to.equal(1);
    const eyebrow = block.querySelector('.rb-top .app-id .t-eyebrow');
    expect(eyebrow).to.exist;
    expect(eyebrow.textContent.trim()).to.equal('Creative Cloud Pro');

    // Headline kept as a single h2 (≤1 h1), stamped with the display class.
    expect(block.querySelectorAll('h1').length).to.be.at.most(1);
    const title = block.querySelector('.rb-top h2.t-title2');
    expect(title).to.exist;

    // Background <picture> moved (not cloned): authored lazy-load preserved.
    const bgImg = block.querySelector('.bg img');
    expect(bgImg).to.exist;
    expect(bgImg.getAttribute('loading')).to.equal('lazy');
  });
});
