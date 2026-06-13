import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-trust.js';

describe('forge-trust', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the EDS-rendered block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-trust');
  });

  it('sets daa-lh analytics attribute on block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-trust');
  });

  it('unwraps EDS wrapper so trust-head and trust-grid are direct block children', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);
    expect(block.querySelector(':scope > .trust-head'), 'trust-head lifted to root').to.exist;
    expect(block.querySelector(':scope > .trust-grid'), 'trust-grid lifted to root').to.exist;
  });

  it('stamps daa-im on all tile images', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);
    const imgs = block.querySelectorAll('img');
    expect(imgs.length, 'three tile images present').to.equal(3);
    imgs.forEach((img) => {
      expect(img.getAttribute('daa-im'), 'each img has daa-im').to.be.a('string');
    });
  });

  it('renders three trust tiles', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);
    expect(block.querySelectorAll('.trust-tile').length).to.equal(3);
  });

  it('handles null el gracefully', async () => {
    await init(null);
  });
});
