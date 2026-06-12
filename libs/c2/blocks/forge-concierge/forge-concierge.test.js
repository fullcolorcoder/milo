// L22 test fixture for the authored Milo C2 block forge-concierge.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-concierge.js';

describe('forge-concierge', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('un-wraps the EDS row/cell so the concierge wrap sits under the block', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    expect(block.dataset.forgeAuthored).to.equal('forge-concierge');
    expect(block.getAttribute('daa-lh')).to.equal('forge-concierge');
    expect(block.querySelector(':scope > .concierge__wrap'), 'concierge__wrap lifted').to.exist;
  });

  it('keeps a single h2 heading and no h1', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    await init(block);

    expect(block.querySelectorAll('h1').length, 'no h1').to.equal(0);
    expect(block.querySelectorAll('h2').length, 'single h2').to.equal(1);
  });

  it('promotes the send affordance to an analytics-tagged button', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    await init(block);

    const send = block.querySelector('.prompt-input .send');
    expect(send, 'send exists').to.exist;
    expect(send.tagName).to.equal('BUTTON');
    expect(send.getAttribute('aria-label')).to.equal('Send');
    expect(send.getAttribute('daa-ll')).to.equal('send');
    expect(send.querySelector('svg'), 'send keeps its icon').to.exist;
  });

  it('tags every suggestion chip for analytics', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    await init(block);

    const chips = block.querySelectorAll('.suggestions .chip');
    expect(chips.length).to.equal(4);
    chips.forEach((chip, i) => {
      expect(chip.getAttribute('daa-ll')).to.equal(`suggestion-${i + 1}`);
    });
  });
});
