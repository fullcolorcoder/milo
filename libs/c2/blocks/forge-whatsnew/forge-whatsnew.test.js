// Gate test for the authored Milo block forge-whatsnew. Runs under Milo's
// @web/test-runner (browser). Asserts init() RECONSTRUCTS the 3-up card grid
// from the flat, class-less DA serialization (the empty-grid regression fails).
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-whatsnew.js';

describe('forge-whatsnew', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the head + 3-card grid from the flat content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-whatsnew');
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-whatsnew');
    const grid = block.querySelector('.whatsnew-grid');
    expect(grid, 'grid container exists').to.exist;
    expect(grid.querySelectorAll('.wn-card').length).to.equal(3);
    expect(block.querySelectorAll('.wn-card .wn-img img').length).to.equal(3);
    expect(block.querySelector('.head .title')).to.exist;
  });
});
