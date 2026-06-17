// L22 test fixture for the authored Milo block forge-usecase.
// Runs under Milo's @web/test-runner (browser). The fixture mirrors the FLAT,
// class-less DA serialization (data-URI media, network-free); the assertions
// gate that init() RECONSTRUCTS the bento grid from that flat run.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-usecase.js';

describe('forge-usecase', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the bento grid from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    await init(block);
    expect(block.dataset.forgeAuthored, 'forge marker').to.equal('forge-usecase');
    expect(block.querySelector('.usecase-grid'), 'grid container built').to.exist;
    expect(block.querySelectorAll('.bento').length, 'one tile per content cluster').to.equal(3);
    expect(block.querySelector('.bento-wide'), 'trailing tile spans full width').to.exist;
    expect(block.querySelectorAll('h1').length, 'no extra h1').to.equal(0);
  });
});
