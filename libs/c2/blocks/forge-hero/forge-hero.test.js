// L22 test fixture for the authored Milo C2 block forge-hero.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-hero.js';

describe('forge-hero', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('un-wraps the EDS row/cell so hero children sit directly under the block', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-hero');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    expect(block.dataset.forgeAuthored).to.equal('forge-hero');
    expect(block.getAttribute('daa-lh')).to.equal('forge-hero');
    // hero sections are now direct children (lifted out of div > div wrappers).
    expect(block.querySelector(':scope > .hero__copy'), 'hero__copy lifted').to.exist;
    expect(block.querySelector(':scope > .hero__asset'), 'hero__asset lifted').to.exist;
    expect(block.querySelector(':scope > .hero__bentos'), 'hero__bentos lifted').to.exist;
  });

  it('keeps exactly one h1 and renders the bento grid', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-hero');
    await init(block);

    expect(block.querySelectorAll('h1').length, 'single h1').to.equal(1);
    expect(block.querySelectorAll('.bento-grid-2 .bento').length).to.equal(2);
  });

  it('converts the non-navigating CTA anchor to an analytics-tagged button', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-hero');
    await init(block);

    const cta = block.querySelector('.hero__cta');
    expect(cta, 'cta exists').to.exist;
    expect(cta.tagName).to.equal('BUTTON');
    expect(cta.getAttribute('daa-ll')).to.equal('Free trial');
  });

  it('preserves authored image attributes and tags them for analytics', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-hero');
    await init(block);

    const asset = block.querySelector('.hero__asset img');
    expect(asset.getAttribute('loading')).to.equal('lazy');
    expect(asset.getAttribute('width')).to.equal('963');
    expect(asset.getAttribute('daa-im')).to.equal('true');
  });
});
