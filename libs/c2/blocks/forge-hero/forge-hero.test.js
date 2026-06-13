import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-hero.js';

describe('forge-hero', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the EDS-rendered block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-hero');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-hero');
  });

  it('sets daa-lh analytics handle on the block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-hero');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-hero');
  });

  it('stamps daa-ll on all links and buttons', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-hero');
    await init(block);
    const interactives = block.querySelectorAll('a[href], button');
    expect(interactives.length, 'mock contains at least one interactive element').to.be.above(0);
    interactives.forEach((node) => {
      expect(node.hasAttribute('daa-ll'), `${node.tagName}.${node.className} must have daa-ll`).to.be.true;
    });
  });

  it('unwraps EDS wrapper divs so authored structure is a direct child of the block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-hero');
    await init(block);
    const nav = block.querySelector(':scope > .nav');
    expect(nav, 'nav is a direct child of block root after unwrap').to.exist;
  });
});
