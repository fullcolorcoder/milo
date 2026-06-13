import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-usecase-4.js';

async function setup() {
  document.body.innerHTML = await readFile({ path: './mocks/body.html' });
  const block = document.querySelector('.forge-usecase-4');
  await init(block);
  return block;
}

describe('forge-usecase-4', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the EDS-rendered block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-4');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-usecase-4');
  });

  it('sets daa-lh analytics handle on the block root', async () => {
    const block = await setup();
    expect(block.getAttribute('daa-lh')).to.equal('forge-usecase-4');
  });

  it('unwraps EDS wrapper divs so uc-grid is a direct child of the block root', async () => {
    const block = await setup();
    const grid = block.querySelector(':scope > .uc-grid');
    expect(grid, 'uc-grid is a direct child of block root after unwrap').to.exist;
  });

  it('renders a section title as h2 with usecase-title class', async () => {
    const block = await setup();
    const title = block.querySelector('.usecase-title');
    expect(title, '.usecase-title is present').to.exist;
    expect(title.tagName.toLowerCase(), 'title is h2').to.equal('h2');
    expect(title.textContent.trim()).to.include('Take your designs further');
  });

  it('renders five uc-card elements', async () => {
    const block = await setup();
    const cards = block.querySelectorAll('.uc-card');
    expect(cards.length, 'five cards rendered').to.equal(5);
  });

  it('renders two light cards and three overlay cards', async () => {
    const block = await setup();
    expect(block.querySelectorAll('.uc-card.light').length, 'two light cards').to.equal(2);
    expect(block.querySelectorAll('.uc-card.overlay').length, 'three overlay cards').to.equal(3);
  });

  it('stamps daa-im on all images for analytics', async () => {
    const block = await setup();
    block.querySelectorAll('img').forEach((img) => {
      expect(img.hasAttribute('daa-im'), `img[alt="${img.alt}"] must have daa-im`).to.be.true;
    });
  });

  it('overlay cards contain a uc-scrim element', async () => {
    const block = await setup();
    block.querySelectorAll('.uc-card.overlay').forEach((card) => {
      expect(card.querySelector('.uc-scrim'), 'overlay card has uc-scrim').to.exist;
    });
  });

  it('all cards contain a picture element with at least one source', async () => {
    const block = await setup();
    block.querySelectorAll('.uc-card').forEach((card) => {
      const pic = card.querySelector('picture');
      expect(pic, 'card has picture').to.exist;
      expect(pic.querySelector('source'), 'picture has at least one source').to.exist;
    });
  });

  it('renders three uc-row elements including one-up and two two-up rows', async () => {
    const block = await setup();
    expect(block.querySelectorAll('.uc-row').length, 'three rows').to.equal(3);
    expect(block.querySelectorAll('.uc-row.two-up').length, 'two two-up rows').to.equal(2);
    expect(block.querySelectorAll('.uc-row.one-up').length, 'one one-up row').to.equal(1);
  });
});
