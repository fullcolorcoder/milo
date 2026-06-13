import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-usecase.js';

describe('forge-usecase', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-usecase');
  });

  it('renders a section heading with uc-title class', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    const heading = block.querySelector('.uc-title');
    expect(heading, 'section heading exists').to.exist;
    expect(heading.tagName.toLowerCase()).to.equal('h3');
    expect(heading.classList.contains('t-h3'), 'heading has t-h3 class').to.be.true;
  });

  it('renders a grid containing all three bento cards', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    const grid = block.querySelector('.grid');
    expect(grid, 'grid container exists').to.exist;
    const bentos = grid.querySelectorAll('.bento');
    expect(bentos.length).to.equal(3);
  });

  it('promotes the last unpaired bento to full-width with a scrim', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    const fullBento = block.querySelector('.bento.full');
    expect(fullBento, 'full bento exists').to.exist;
    expect(fullBento.querySelector('.scrim'), 'scrim overlay exists').to.exist;
  });

  it('wraps the first two bentos together in one grid row', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    const rows = block.querySelectorAll('.grid > .row');
    expect(rows.length).to.equal(2);
    expect(rows[0].querySelectorAll('.bento').length).to.equal(2);
    expect(rows[1].querySelectorAll('.bento').length).to.equal(1);
  });

  it('preserves picture elements with their source tags intact', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    const pictures = block.querySelectorAll('picture');
    expect(pictures.length).to.equal(3);
    pictures.forEach((pic) => {
      expect(pic.querySelectorAll('source').length).to.be.greaterThan(0);
      const img = pic.querySelector('img');
      expect(img, 'img inside picture').to.exist;
      expect(img.getAttribute('loading')).to.equal('lazy');
    });
  });

  it('stamps daa-lh on the block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-usecase');
  });
});
