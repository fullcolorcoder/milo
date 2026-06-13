import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-bentos.js';

describe('forge-bentos', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the EDS-rendered block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-bentos');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-bentos');
  });

  it('sets daa-lh on the block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-bentos');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-bentos');
  });

  it('builds a bento-grid with two rows of two cards each', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-bentos');
    await init(block);
    const grid = block.querySelector('.bento-grid');
    expect(grid, 'bento-grid present').to.exist;
    const rows = grid.querySelectorAll('.bento-row');
    expect(rows.length, 'two bento rows').to.equal(2);
    const cards = grid.querySelectorAll('.bento');
    expect(cards.length, 'four bento cards').to.equal(4);
  });

  it('places the section title as an h2 with bentos-title class', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-bentos');
    await init(block);
    const title = block.querySelector('h2.bentos-title');
    expect(title, 'h2.bentos-title present').to.exist;
  });

  it('stamps t-h6 on each card heading', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-bentos');
    await init(block);
    const headings = block.querySelectorAll('.bento-copy h3.t-h6');
    expect(headings.length, 'four h3.t-h6 headings').to.equal(4);
  });

  it('preserves lazy loading on bento images', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-bentos');
    await init(block);
    const imgs = block.querySelectorAll('img');
    expect(imgs.length, 'four images').to.equal(4);
    imgs.forEach((img) => {
      expect(img.getAttribute('loading'), 'lazy loading preserved').to.equal('lazy');
    });
  });
});
