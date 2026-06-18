// L22 fixture test for the authored Milo C2 block forge-workfaster.
// Runs under Milo's @web/test-runner (browser). Each it() loads the fixture
// itself (no shared async hook) and keeps to a few focused assertions.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-workfaster.js';

describe('forge-workfaster', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the head + cards media from the flat DA cell', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-workfaster');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    // Head wrapper rebuilt around the heading, promoted to title typography.
    const head = block.querySelector('.head');
    expect(head, 'head wrapper rebuilt').to.exist;
    expect(head.querySelector('.t-title2'), 'heading promoted to t-title2').to.exist;

    // Exactly one cards media wrapper for the one authored picture, image kept.
    const cards = block.querySelectorAll('.workfaster-cards');
    expect(cards.length, 'one cards media wrapper per picture').to.equal(1);
    expect(cards[0].querySelector('picture img'), 'picture image preserved').to.exist;

    expect(block.dataset.forgeAuthored).to.equal('forge-workfaster');
  });
});
