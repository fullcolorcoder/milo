import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-usecase-5.js';

describe('forge-usecase-5', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-5');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-usecase-5');
  });

  it('renders a section heading with uc-title class', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-5');
    await init(block);
    const heading = block.querySelector('.uc-title');
    expect(heading, 'section heading exists').to.exist;
    expect(heading.tagName.toLowerCase()).to.equal('h3');
    expect(heading.classList.contains('t-h3'), 'heading has t-h3 class').to.be.true;
  });

  it('renders a grid containing all four bento cards', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-5');
    await init(block);
    const grid = block.querySelector('.grid');
    expect(grid, 'grid container exists').to.exist;
    const bentos = grid.querySelectorAll('.bento');
    expect(bentos.length).to.equal(4);
  });

  it('lays out four bentos in two rows of two', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-5');
    await init(block);
    const rows = block.querySelectorAll('.grid > .row');
    expect(rows.length).to.equal(2);
    rows.forEach((row) => {
      expect(row.querySelectorAll('.bento').length).to.equal(2);
    });
  });

  it('preserves picture elements with their source tags intact', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-5');
    await init(block);
    const pictures = block.querySelectorAll('picture');
    expect(pictures.length).to.equal(4);
    pictures.forEach((pic) => {
      expect(pic.querySelectorAll('source').length).to.be.greaterThan(0);
      const img = pic.querySelector('img');
      expect(img, 'img inside picture').to.exist;
      expect(img.getAttribute('loading')).to.equal('lazy');
    });
  });

  it('stamps daa-lh on the block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-5');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-usecase-5');
  });
});
