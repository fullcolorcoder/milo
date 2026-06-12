// L22 test fixture for the authored Milo C2 block forge-usecase-3.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-usecase-3.js';

describe('forge-usecase-3', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('un-wraps the EDS row/cell so the usecase content sits directly under the block', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-3');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    expect(block.dataset.forgeAuthored).to.equal('forge-usecase-3');
    expect(block.getAttribute('daa-lh')).to.equal('forge-usecase-3');
    expect(block.querySelector(':scope > .usecase__title'), 'title lifted').to.exist;
    expect(block.querySelector(':scope > .usecase__grid'), 'grid lifted').to.exist;
  });

  it('renders a single h1-free heading outline and the two-row bento grid', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-3');
    await init(block);

    expect(block.querySelectorAll('h1').length, 'no h1 in a section block').to.equal(0);
    expect(block.querySelectorAll('.usecase__grid > .row-2').length).to.equal(2);
    expect(block.querySelectorAll('.row-2 .bento').length).to.equal(4);
    expect(block.querySelectorAll('.bento--image').length).to.equal(3);
  });

  it('preserves authored image attributes and tags them for analytics', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-3');
    await init(block);

    const imgs = block.querySelectorAll('img');
    expect(imgs.length).to.equal(4);
    imgs.forEach((img) => {
      expect(img.getAttribute('loading')).to.equal('lazy');
      expect(img.getAttribute('daa-im')).to.equal('true');
    });
  });
});
