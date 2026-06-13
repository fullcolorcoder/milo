import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-bentos.js';

describe('forge-bentos', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the block into a bento grid', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-bentos');
    expect(block, 'block root exists').to.exist;

    await init(block);

    expect(block.dataset.forgeAuthored, 'forge marker set').to.equal('forge-bentos');
    expect(block.getAttribute('daa-lh'), 'analytics handle').to.equal('forge-bentos');

    const title = block.querySelector('.title');
    expect(title, 'section title present').to.exist;
    expect(title.tagName, 'title is h2').to.equal('H2');

    const grid = block.querySelector('.grid');
    expect(grid, 'grid container present').to.exist;

    const bentos = block.querySelectorAll('.bento');
    expect(bentos.length, 'four bento cards').to.equal(4);

    const pics = block.querySelectorAll('.bento .pic');
    expect(pics.length, 'four pic areas').to.equal(4);

    const txts = block.querySelectorAll('.bento .txt');
    expect(txts.length, 'four txt areas').to.equal(4);

    const h3s = block.querySelectorAll('.bento .txt h3');
    expect(h3s.length, 'four bento headings').to.equal(4);

    const h1s = block.querySelectorAll('h1');
    expect(h1s.length, 'no h1 elements (L8)').to.equal(0);

    block.querySelectorAll('img').forEach((img) => {
      expect(img.getAttribute('loading'), 'lazy loading preserved').to.equal('lazy');
    });
  });

  it('is safe to call with null', async () => {
    await init(null);
  });
});
