// L22 test fixture for the authored Milo block forge-bentos. Runs under Milo's
// @web/test-runner (browser). The fixture is the FLAT, class-less DA
// serialization (mocks/body.html) and each it() loads it self-contained.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-bentos.js';

describe('forge-bentos', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the bento grid from the flat authored content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-bentos');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    // Marker + reconstructed containers exist.
    expect(block.dataset.forgeAuthored).to.equal('forge-bentos');
    expect(block.querySelector('.bento-grid'), 'grid container built').to.exist;
    expect(block.querySelector('.bentos-title'), 'title stamped').to.exist;

    // Group count === picture count (4 tiles, 2 rows of 2) — guards the
    // empty-grid / dropped-card regression.
    expect(block.querySelectorAll('.bento').length).to.equal(4);
    expect(block.querySelectorAll('.bento-row').length).to.equal(2);
    expect(block.querySelectorAll('.bento .bento-img img').length).to.equal(4);
  });

  it('keeps exactly one h2 and no h1', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-bentos');
    await init(block);
    expect(block.querySelectorAll('h1').length).to.equal(0);
    expect(block.querySelectorAll('h2').length).to.equal(1);
  });
});
