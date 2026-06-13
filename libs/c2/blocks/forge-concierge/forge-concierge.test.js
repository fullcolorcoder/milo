import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-concierge.js';

describe('forge-concierge', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('handles null el gracefully', async () => {
    await init(null);
  });

  it('decorates the EDS-rendered block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-concierge');
  });

  it('sets daa-lh analytics handle on the block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-concierge');
  });

  it('stamps daa-ll on all links and buttons', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    await init(block);
    const interactives = block.querySelectorAll('a[href], button');
    expect(interactives.length, 'block contains at least one interactive element').to.be.above(0);
    interactives.forEach((node) => {
      expect(node.hasAttribute('daa-ll'), `${node.tagName}.${node.className} must have daa-ll`).to.be.true;
    });
  });

  it('renders h2 heading from authored content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    await init(block);
    const heading = block.querySelector('h2.concierge-title');
    expect(heading, 'h2.concierge-title exists').to.exist;
    expect(heading.textContent.trim()).to.equal("Find what you're looking for.");
  });

  it('renders suggestion chips from authored rows', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    await init(block);
    const chips = block.querySelectorAll('.suggestion');
    expect(chips.length, 'has four suggestion chips').to.equal(4);
  });

  it('renders legal text with links', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    await init(block);
    const legal = block.querySelector('.concierge-legal');
    expect(legal, 'legal paragraph exists').to.exist;
    expect(legal.querySelectorAll('a').length, 'legal has two links').to.equal(2);
  });

  it('renders the prompt input field', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    await init(block);
    const input = block.querySelector('input.prompt-field');
    expect(input, 'prompt input exists').to.exist;
    expect(input.getAttribute('placeholder')).to.equal('Ask anything');
  });
});
