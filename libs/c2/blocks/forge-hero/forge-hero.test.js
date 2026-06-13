import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-hero.js';

describe('forge-hero', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates block and rebuilds DOM structure', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-hero');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    expect(block.dataset.forgeAuthored).to.equal('forge-hero');
    expect(block.getAttribute('daa-lh')).to.equal('forge-hero');
    expect(block.querySelector('.copy'), '.copy section rendered').to.exist;
    expect(block.querySelector('.head'), '.head wrapper rendered').to.exist;
    expect(block.querySelector('.asset'), '.asset section rendered').to.exist;
    expect(block.querySelector('.promo'), '.promo section rendered').to.exist;
    expect(block.querySelector('h1'), 'h1 preserved').to.exist;
    expect(block.querySelector('.free-trial'), 'free-trial CTA present').to.exist;
    expect(block.querySelector('.free-trial').getAttribute('daa-ll')).to.equal('free-trial');
  });

  it('is safe to call with null', async () => {
    await init(null);
  });
});
