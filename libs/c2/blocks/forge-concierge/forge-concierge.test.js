// L22 test fixture for the authored Milo block forge-concierge.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// Each it() loads the network-free (data-URI) fixture itself — no shared hook.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-concierge.js';

describe('forge-concierge', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('rebuilds the prompt pill, suggestion chips and legal line from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-concierge');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    // Reconstruction is gated, not assumed.
    expect(block.dataset.forgeAuthored).to.equal('forge-concierge');
    expect(block.querySelector('.section-inner .concierge-title'), 'title').to.exist;
    const input = block.querySelector('.concierge-prompt .prompt-input');
    expect(input, 'prompt pill').to.exist;
    expect(input.querySelector('.pi-left .prompt-ico img'), 'leading icon').to.exist;
    expect(input.querySelector('button.prompt-send'), 'send control').to.exist;
    expect(block.querySelectorAll('.concierge-sugs .sug').length, 'four suggestion chips').to.equal(4);
    expect(block.querySelectorAll('.concierge-legal a').length, 'two legal links').to.equal(2);
  });
});
