// L22 fixture test for the authored Milo block forge-usecase-6.
// Runs under Milo's @web/test-runner (browser). The ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so this block gates on ITS own test.
// Each it() loads the network-free fixture itself (no shared async hook) so the
// browser session never hangs on a heavy beforeEach.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-usecase-6.js';

describe('forge-usecase-6', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the bento grid from the FLAT DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-6');
    await init(block);
    // The grid container and every tile must be rebuilt from the flat run —
    // an empty/absent grid is the regression this gate guards against.
    expect(block.querySelector('.usecase-grid'), 'grid container').to.exist;
    expect(block.querySelectorAll('.bento').length, 'one tile per media picture').to.equal(5);
    expect(block.querySelectorAll('.bento-row').length, 'tiles grouped into rows').to.be.at.least(2);
  });

  it('keeps the title, badges and forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase-6');
    await init(block);
    expect(block.querySelector('.usecase-title'), 'section title preserved').to.exist;
    expect(block.querySelectorAll('.bento-badge').length, 'brand badges attached').to.equal(2);
    expect(block.dataset.forgeAuthored).to.equal('forge-usecase-6');
  });
});
