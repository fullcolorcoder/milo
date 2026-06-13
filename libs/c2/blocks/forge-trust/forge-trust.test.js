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

  it('sets daa-lh on the block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-trust');
  });

  it('builds a trust-head with eyebrow and headline', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);
    const head = block.querySelector('.trust-head');
    expect(head, 'trust-head present').to.exist;
    expect(head.querySelector('.trust-eyebrow'), 'eyebrow present').to.exist;
    const headline = head.querySelector('h2.trust-headline');
    expect(headline, 'h2.trust-headline present').to.exist;
  });

  it('builds a trust-grid with three trust-tile articles', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);
    const grid = block.querySelector('.trust-grid');
    expect(grid, 'trust-grid present').to.exist;
    const tiles = grid.querySelectorAll('.trust-tile');
    expect(tiles.length, 'three trust-tiles').to.equal(3);
  });

  it('stamps t-h6 on each tile heading', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);
    const headings = block.querySelectorAll('.trust-copy h3.t-h6');
    expect(headings.length, 'three h3.t-h6 headings').to.equal(3);
  });

  it('preserves lazy loading on tile images', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);
    const imgs = block.querySelectorAll('.trust-img img');
    expect(imgs.length, 'three images').to.equal(3);
    imgs.forEach((img) => {
      expect(img.getAttribute('loading'), 'lazy loading preserved').to.equal('lazy');
    });
  });
});
