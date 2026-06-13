// Smoke fixture for the authored Milo block forge-concierge.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-concierge.js';

describe('forge-concierge', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('rebuilds the concierge prompt section and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    expect(block.dataset.forgeAuthored).to.equal('forge-concierge');
    expect(block.getAttribute('daa-lh')).to.equal('forge-concierge');

    // Single centered wrap holds the whole section.
    const cwrap = block.querySelector(':scope > .cwrap');
    expect(cwrap, 'centered wrap').to.exist;

    // Exactly one heading, carried from the authored h2 (never an h1).
    expect(block.querySelectorAll('h1').length).to.equal(0);
    const heading = cwrap.querySelector('h2');
    expect(heading, 'heading').to.exist;
    expect(heading.textContent).to.contain('Find what');

    // Prompt bar: decorative spark + placeholder + send glyph.
    const input = cwrap.querySelector('.prompt .input');
    expect(input, 'prompt input bar').to.exist;
    expect(input.querySelector('.spark svg'), 'spark glyph').to.exist;
    expect(input.querySelector('.send svg'), 'send glyph').to.exist;
    expect(input.querySelector('.ph').textContent).to.equal('Ask anything');

    // Four suggestion pills.
    expect(cwrap.querySelectorAll('.sugg .pill').length).to.equal(4);

    // Disclaimer keeps the real links with analytics handles.
    const disc = cwrap.querySelector('.disc');
    expect(disc, 'disclaimer').to.exist;
    const links = disc.querySelectorAll('a');
    expect(links.length).to.equal(2);
    expect(links[0].getAttribute('href')).to.equal('/privacy#');
    expect(links[0].getAttribute('daa-ll')).to.equal('Privacy Policy');
    expect(links[1].getAttribute('href')).to.equal('/genai-terms#');
  });
});
