import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-usecase.js';

describe('forge-usecase', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the EDS-rendered block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-usecase');
  });

  it('sets daa-lh on the block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-usecase');
  });

  it('builds a usecase-grid with two bento-rows and four cards', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    const grid = block.querySelector('.usecase-grid');
    expect(grid, 'usecase-grid present').to.exist;
    const rows = grid.querySelectorAll('.bento-row');
    expect(rows.length, 'two bento rows').to.equal(2);
    const cards = grid.querySelectorAll('.bento');
    expect(cards.length, 'four bento cards').to.equal(4);
  });

  it('places the section title as an h2 with usecase-title class', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    const title = block.querySelector('h2.usecase-title');
    expect(title, 'h2.usecase-title present').to.exist;
    expect(title.textContent.trim()).to.include('release-ready videos');
  });

  it('stamps t-h6 on each card heading', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    const headings = block.querySelectorAll('.bento-copy h3.t-h6');
    expect(headings.length, 'four h3.t-h6 headings').to.equal(4);
  });

  it('extracts badge SVGs into aria-hidden .bento-badge spans', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    const badges = block.querySelectorAll('.bento-badge');
    expect(badges.length, 'four bento badges').to.equal(4);
    badges.forEach((badge) => {
      expect(badge.getAttribute('aria-hidden'), 'badge aria-hidden').to.equal('true');
      expect(badge.querySelector('svg'), 'badge contains svg').to.exist;
    });
  });

  it('preserves lazy loading on bento media images', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    const imgs = block.querySelectorAll('.bento-media img');
    expect(imgs.length, 'four media images').to.equal(4);
    imgs.forEach((img) => {
      expect(img.getAttribute('loading'), 'lazy loading preserved').to.equal('lazy');
    });
  });
});
