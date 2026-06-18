// Test for the authored Milo block forge-plans.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// Fixture is loaded INSIDE each it() (self-contained) to keep the gate stable.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-plans.js';

describe('forge-plans', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the plan grid from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-plans');
    await init(block);
    // Grid built, one column per plan (4 h3s), with a card + features each.
    expect(block.querySelector('.plan-grid'), 'grid container present').to.exist;
    expect(block.querySelectorAll('.plan-col').length, 'one col per plan').to.equal(4);
    expect(block.querySelectorAll('.plan-grid .plan-card').length).to.equal(4);
    // Tabs, featured tier, compare CTA, and the forge marker.
    expect(block.querySelectorAll('.tabs .tab').length, 'three audience tabs').to.equal(3);
    expect(block.querySelector('.plan-col.featured'), 'last tier featured').to.exist;
    expect(block.querySelector('.compare-wrap a'), 'compare CTA present').to.exist;
    expect(block.dataset.forgeAuthored).to.equal('forge-plans');
  });
});
