// L22 fixture test for the authored Milo block forge-roller.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// Each it() loads the fixture itself (no shared async hook) to keep the gate fast.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-roller.js';

describe('forge-roller', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the roller layout from the flat DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    await init(block);
    // The fixture has 8 app names after the "Video" category label.
    expect(block.querySelector('.section-inner'), 'section rebuilt').to.exist;
    expect(block.querySelectorAll('.roller-app').length).to.equal(8);
    expect(block.querySelectorAll('.roller-app.is-active').length).to.equal(1);
    expect(block.querySelector('.roller-media-icon'), 'icon overlay built').to.exist;
    expect(block.dataset.forgeAuthored).to.equal('forge-roller');
  });
});
