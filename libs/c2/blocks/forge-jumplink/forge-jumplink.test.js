// Test fixture for the authored Milo block forge-jumplink.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// Each it() loads the fixture itself (no shared async hook) and the fixture is
// network-free (data-URI images) so the browser session never stalls.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-jumplink.js';

describe('forge-jumplink', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the layered hero from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jumplink');
    await init(block);
    // Background photo + relative inner column were rebuilt from the flat run.
    expect(block.querySelector('.jumplink-bg'), 'background picture').to.exist;
    expect(block.querySelector('.section-inner .jumplink-content'), 'content column').to.exist;
    // Eyebrow row holds the icon + label; the title is promoted to a heading.
    expect(block.querySelectorAll('.app-id .app-id-icon').length).to.equal(1);
    expect(block.querySelector('.app-id .t-eyebrow')?.textContent).to.contain('Creative Cloud Pro');
    expect(block.querySelector('.jumplink-content h2.t-title2'), 'title heading').to.exist;
    expect(block.dataset.forgeAuthored).to.equal('forge-jumplink');
  });
});
