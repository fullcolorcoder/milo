// L22 test fixture for the authored Milo C2 block forge-jump.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-jump.js';

describe('forge-jump', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('un-wraps the EDS row/cell so jump children sit directly under the block', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jump');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    expect(block.dataset.forgeAuthored).to.equal('forge-jump');
    expect(block.getAttribute('daa-lh')).to.equal('forge-jump');
    expect(block.querySelector(':scope > .jump__bg'), 'jump__bg lifted').to.exist;
    expect(block.querySelector(':scope > .jump__top'), 'jump__top lifted').to.exist;
  });

  it('renders the headline as a single non-h1 heading', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jump');
    await init(block);

    expect(block.querySelectorAll('h1').length, 'no h1').to.equal(0);
    const head = block.querySelector('.jump__head');
    expect(head, 'headline exists').to.exist;
    expect(head.tagName).to.equal('H2');
  });

  it('preserves authored image attributes and tags them for analytics', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jump');
    await init(block);

    const bg = block.querySelector('.jump__bg img');
    expect(bg.getAttribute('loading')).to.equal('lazy');
    expect(bg.getAttribute('daa-im')).to.equal('true');

    const icon = block.querySelector('.eyebrow .cc');
    expect(icon.getAttribute('width')).to.equal('24');
    expect(icon.getAttribute('daa-im')).to.equal('true');
  });
});
