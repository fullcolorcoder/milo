// L22 test fixture for the authored Milo C2 block forge-trust.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-trust.js';

describe('forge-trust', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('un-wraps the EDS row/cell so the trust content sits directly under the block', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    expect(block.dataset.forgeAuthored).to.equal('forge-trust');
    expect(block.getAttribute('daa-lh')).to.equal('forge-trust');
    expect(block.querySelector(':scope > .trust__head'), 'head lifted').to.exist;
    expect(block.querySelector(':scope > .trust__tiles'), 'tiles lifted').to.exist;
  });

  it('renders a single h1-free heading outline and the full 3-up tile grid', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);

    expect(block.querySelectorAll('h1').length, 'no h1 in a section block').to.equal(0);
    expect(block.querySelectorAll('.trust__head h2').length).to.equal(1);
    expect(block.querySelectorAll('.trust__tiles .tile').length).to.equal(3);
  });

  it('preserves authored image attributes and tags them for analytics', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);

    const imgs = block.querySelectorAll('img');
    expect(imgs.length).to.equal(3);
    imgs.forEach((img) => {
      expect(img.getAttribute('loading')).to.equal('lazy');
      expect(img.getAttribute('daa-im')).to.equal('true');
    });
  });
});
