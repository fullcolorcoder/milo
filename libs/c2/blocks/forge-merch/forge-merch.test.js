// L22 fixture for the authored Milo block forge-merch. Runs under Milo's
// @web/test-runner (browser). The fixture is the class-less DA serialization;
// each it() loads it self-contained (no shared async hook) and asserts that
// init() RECONSTRUCTED the centered lockup — so a regression to a flat stack
// fails the gate.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-merch.js';

describe('forge-merch', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the lockup and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-merch');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-merch');
    // Copy lockup + the composite CC badge were rebuilt from the flat run.
    expect(block.querySelector('.merch-copy .cc-ico .cc-ico-tile'), 'composite badge').to.exist;
    // Both standalone CTAs landed in the button row (primary + outline).
    expect(block.querySelectorAll('.merch-btns a').length, 'two CTAs').to.equal(2);
    // The hero merch picture became the .merch-img media slot (not an icon).
    expect(block.querySelector('.merch-img img'), 'hero merch image').to.exist;
  });
});
