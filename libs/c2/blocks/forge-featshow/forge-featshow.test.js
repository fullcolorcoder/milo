// Smoke + reconstruction fixture for the authored Milo block forge-featshow.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-featshow.js';

describe('forge-featshow', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('rebuilds the showcase layout from the flat DA cell', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-featshow');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    // analytics + marker
    expect(block.getAttribute('daa-lh')).to.equal('forge-featshow');
    expect(block.dataset.forgeAuthored).to.equal('forge-featshow');

    // reconstructed structure (classes stamped by decorate, not by DA)
    const stage = block.querySelector('.forge-featshow-inner');
    expect(stage, 'inner stage rebuilt').to.exist;

    const win = stage.querySelector('.forge-featshow-window');
    expect(win, 'showcase window rebuilt').to.exist;
    expect(win.querySelector('picture'), 'window keeps the picture').to.exist;
    expect(win.querySelector('img'), 'window keeps the img').to.exist;

    // media preserved (move, not serialize)
    const img = win.querySelector('img');
    expect(img.getAttribute('loading')).to.equal('lazy');
    expect(img.getAttribute('daa-im')).to.equal('true');

    // CTA rebuilt + wired
    const cta = block.querySelector('.forge-featshow-cta .forge-featshow-button');
    expect(cta, 'cta button rebuilt').to.exist;
    expect(cta.tagName).to.equal('A');
    expect(cta.getAttribute('href')).to.equal('/free-trial');
    expect(cta.getAttribute('daa-ll')).to.equal('Free trial');
  });
});
