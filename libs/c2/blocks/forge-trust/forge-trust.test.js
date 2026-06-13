import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-trust.js';

describe('forge-trust', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-trust');
    expect(block.getAttribute('daa-lh')).to.equal('forge-trust');
  });

  it('builds .thead with eyebrow and h2', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);

    const thead = block.querySelector('.thead');
    expect(thead, '.thead div exists').to.exist;

    const eyebrow = thead.querySelector('span.eb.t-eyebrow');
    expect(eyebrow, 'eyebrow span present').to.exist;
    expect(eyebrow.textContent.trim()).to.include('World-class tools');

    const heading = thead.querySelector('h2.t-h2');
    expect(heading, 'h2 with t-h2 class').to.exist;
    expect(heading.textContent).to.include('Creative Cloud Pro');
  });

  it('builds three .etile articles with pic and txt', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);

    const tiles = block.querySelectorAll('.etile');
    expect(tiles.length, 'three tiles rendered').to.equal(3);

    tiles.forEach((tile) => {
      expect(tile.querySelector('.pic picture'), 'tile has <picture> in .pic').to.exist;
      expect(tile.querySelector('.txt h3.t-h6'), 'tile has h3.t-h6 in .txt').to.exist;
      expect(tile.querySelector('.txt p.t-body-md'), 'tile has p.t-body-md in .txt').to.exist;
    });
  });

  it('preserves picture source and img attributes', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-trust');
    await init(block);

    const firstImg = block.querySelector('.etile .pic img');
    expect(firstImg, 'img present in first tile').to.exist;
    expect(firstImg.getAttribute('loading')).to.equal('lazy');
    expect(firstImg.getAttribute('alt')).to.be.a('string').and.not.empty;
  });
});
