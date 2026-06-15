// Fixture for the authored Milo block forge-cap. Runs under Milo's
// @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-cap.js';

describe('forge-cap', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the capability grid + badges from flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-cap');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    // Reconstruction is gated, not assumed (DA strips the authored classes).
    const grid = block.querySelector('.cap__grid');
    expect(grid, 'grid container rebuilt').to.exist;

    const items = block.querySelectorAll('.cap__item');
    expect(items.length, 'one tile per capability image').to.equal(4);

    items.forEach((item) => {
      expect(item.querySelector('img'), 'tile keeps its media').to.exist;
      expect(item.querySelector('.cap__caption'), 'tile has a caption').to.exist;
    });

    const badges = block.querySelector('.badges');
    expect(badges, 'badges row rebuilt').to.exist;
    expect(badges.querySelectorAll('img').length, 'two store badges').to.equal(2);
    expect(badges.querySelector('.meta'), 'meta line present').to.exist;

    expect(block.dataset.forgeAuthored).to.equal('forge-cap');
  });
});
