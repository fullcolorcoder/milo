// L22 gate for forge-usecase-5. Runs under Milo's @web/test-runner (browser).
// The fixture mirrors DA's FLAT, class-less serialization; each it() loads it
// self-contained (no shared async hook) and stays network-free (data-URI media).
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-usecase-5.js';

const loadBlock = async () => {
  document.body.innerHTML = await readFile({ path: './mocks/body.html' });
  const block = document.querySelector('.forge-usecase-5');
  await init(block);
  return block;
};

describe('forge-usecase-5', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the bento grid from the flat content', async () => {
    const block = await loadBlock();
    expect(block.querySelector('.section-inner'), 'section-inner built').to.exist;
    expect(block.querySelector('.usecase-grid'), 'grid built').to.exist;
    expect(block.querySelectorAll('.bento-row').length, 'two rows of two').to.equal(2);
    expect(block.querySelectorAll('.bento').length, 'one tile per media picture').to.equal(4);
  });

  it('gives every tile a reserved media slot and keeps lazy loading', async () => {
    const block = await loadBlock();
    const imgs = block.querySelectorAll('.bento-img img');
    expect(imgs.length, 'four media images').to.equal(4);
    expect(imgs[0].getAttribute('loading'), 'lazy preserved').to.equal('lazy');
  });

  it('maps badges: Firefly single + two CC composites, tile 2 bare', async () => {
    const block = await loadBlock();
    expect(block.querySelectorAll('.bento-badge').length, 'three badged tiles').to.equal(3);
    expect(block.querySelectorAll('.cc-ico').length, 'two CC composites').to.equal(2);
  });

  it('keeps one h1-free heading hierarchy and stamps the forge marker', async () => {
    const block = await loadBlock();
    expect(block.querySelectorAll('h1').length, 'no h1 in the block').to.equal(0);
    expect(block.querySelector('h2.usecase-title'), 'section title kept as h2').to.exist;
    expect(block.dataset.forgeAuthored).to.equal('forge-usecase-5');
  });
});
