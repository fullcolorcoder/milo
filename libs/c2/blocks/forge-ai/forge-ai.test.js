// L22 fixture for the authored Milo block forge-ai. Runs under Milo's
// @web/test-runner (browser). The fixture mirrors the FLAT, class-less DA
// serialisation (NOT section.html), and the assertions GATE the reconstruction
// that init() performs from content order alone.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-ai.js';

describe('forge-ai', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the smart panel + accordion + "more" panel from flat content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-ai');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    // Forge markers.
    expect(block.getAttribute('daa-lh')).to.equal('forge-ai');
    expect(block.dataset.forgeAuthored).to.equal('forge-ai');

    // Smart panel rebuilt.
    expect(block.querySelector('.ai-smart'), 'smart wrapper').to.exist;
    expect(block.querySelector('.ai-head .ai-title'), 'title in head').to.exist;
    const panel = block.querySelector('.ai-panel');
    expect(panel, 'image panel').to.exist;
    expect(panel.querySelector(':scope > picture'), 'hero picture inside panel').to.exist;

    // Accordion: 5 items, first one open, each with a body.
    const items = block.querySelectorAll('.ai-accordion .ai-acc-item');
    expect(items.length, 'accordion item count').to.equal(5);
    expect(items[0].classList.contains('is-open'), 'first item open').to.be.true;
    expect(block.querySelectorAll('.ai-acc-item .ai-acc-body').length).to.equal(5);
    expect(block.querySelectorAll('.ai-acc-trigger').length).to.equal(5);

    // Prompt caption recovered from the bare text node.
    const prompt = block.querySelector('.ai-prompt');
    expect(prompt, 'prompt caption').to.exist;
    expect(prompt.textContent).to.match(/orange lighting/i);

    // "More than an app" panel rebuilt.
    expect(block.querySelector('.ai-more .ai-more-title'), 'more title').to.exist;
    const lis = block.querySelectorAll('.ai-more-list > li');
    expect(lis.length, 'more list items').to.equal(5);
    lis.forEach((li) => expect(li.querySelector('.txt'), 'li wrapped in .txt').to.exist);
    const card = block.querySelector('.ai-card-float');
    expect(card, 'floating card').to.exist;
    expect(card.querySelector('picture'), 'card picture').to.exist;

    // No h1 created (section-level h1 budget respected).
    expect(block.querySelectorAll('h1').length).to.equal(0);
  });
});
