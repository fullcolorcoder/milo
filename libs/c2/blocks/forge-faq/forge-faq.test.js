// L22 fixture test for the authored Milo block forge-faq. Runs under Milo's
// @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-faq.js';

describe('forge-faq', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the accordion from the flat class-less DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    // Marker stamped + analytics handle set.
    expect(block.dataset.forgeAuthored).to.equal('forge-faq');
    expect(block.getAttribute('daa-lh')).to.equal('forge-faq');

    // Structure was REBUILT (not assumed from authored classes).
    expect(block.querySelector('.section-inner'), 'section wrapper').to.exist;
    expect(block.querySelector('.faq-title'), 'heading').to.exist;
    expect(block.querySelectorAll('h1').length, 'at most one h1').to.be.at.most(1);

    // 7 questions -> 7 accordion items, each with a toggle button + answer region.
    const items = block.querySelectorAll('.faq-item');
    expect(items.length, 'seven faq items').to.equal(7);
    expect(block.querySelectorAll('.faq-q').length).to.equal(7);
    expect(block.querySelectorAll('button.faq-q[aria-expanded]').length).to.equal(7);

    // First item open by default.
    expect(items[0].classList.contains('is-open'), 'first item open').to.be.true;
    expect(items[0].querySelector('.faq-q').getAttribute('aria-expanded')).to.equal('true');

    // The single authored answer (with its link) was moved into the first item.
    const firstAnswer = items[0].querySelector('.faq-a');
    expect(firstAnswer, 'first answer region').to.exist;
    expect(firstAnswer.querySelector('a'), 'answer link preserved').to.exist;

    // Toggle behaviour: clicking flips state.
    const secondBtn = items[1].querySelector('.faq-q');
    expect(secondBtn.getAttribute('aria-expanded')).to.equal('false');
    secondBtn.click();
    expect(secondBtn.getAttribute('aria-expanded')).to.equal('true');
    expect(items[1].classList.contains('is-open')).to.be.true;
  });
});
