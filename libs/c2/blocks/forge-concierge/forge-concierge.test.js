// L22 fixture for the authored Milo C2 block forge-concierge.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// The mock body is the REAL class-less DA serialization (flat <h2>/<p>/<picture>
// run) — the test asserts init() RECONSTRUCTS the prompt lockup from it.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-concierge.js';

describe('forge-concierge', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the concierge lockup from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    // Forge marker + section analytics handle.
    expect(block.dataset.forgeAuthored).to.equal('forge-concierge');
    expect(block.getAttribute('daa-lh')).to.equal('forge-concierge');

    // Rebuilt structure: one inner, one prompt, one p-input, one chips group.
    expect(block.querySelectorAll('.section-inner').length).to.equal(1);
    expect(block.querySelectorAll('.prompt').length).to.equal(1);
    expect(block.querySelectorAll('.p-input').length).to.equal(1);
    expect(block.querySelectorAll('.chips').length).to.equal(1);

    // Title survives as a single h2 (no h1 introduced).
    expect(block.querySelectorAll('h1').length).to.equal(0);
    expect(block.querySelector('.cc-title')).to.exist;

    // Input row carries the AI icon, a placeholder, and a send button.
    expect(block.querySelector('.p-input .ai picture')).to.exist;
    expect(block.querySelector('.p-input .ph')).to.exist;
    expect(block.querySelector('.p-input .send')).to.exist;
    expect(block.querySelector('.p-input .ph').textContent).to.contain('Ask anything');

    // Four suggestion chips, each a real <button> (action, not navigation).
    const chips = block.querySelectorAll('.chips .chip');
    expect(chips.length).to.equal(4);
    chips.forEach((c) => expect(c.tagName).to.equal('BUTTON'));

    // Legal copy preserved with its two links, decorated readable on dark.
    expect(block.querySelector('.legal')).to.exist;
    expect(block.querySelectorAll('.legal a').length).to.equal(2);

    // <picture> moved (not cloned): authored dimensions preserved.
    const aiImg = block.querySelector('.p-input .ai img');
    expect(aiImg.getAttribute('width')).to.equal('24');
  });
});
