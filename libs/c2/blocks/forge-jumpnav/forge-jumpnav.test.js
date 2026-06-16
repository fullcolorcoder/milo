// Test fixture for the authored Milo C2 block forge-jumpnav (L22 gate).
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-jumpnav.js';

describe('forge-jumpnav', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('reconstructs the jumpnav structure from the flat DA serialization', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jumpnav');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    // Forge marker + section analytics handle.
    expect(block.dataset.forgeAuthored).to.equal('forge-jumpnav');
    expect(block.getAttribute('daa-lh')).to.equal('forge-jumpnav');

    // Structure was REBUILT (not assumed from authored classes): scrim,
    // foreground column, eyebrow pill, single title, and the jump-link row.
    expect(block.querySelector('.jn-scrim'), 'scrim overlay').to.exist;
    const inner = block.querySelector('.jn-inner');
    expect(inner, 'foreground column').to.exist;
    expect(block.querySelector('.jn-eyebrow-pill'), 'eyebrow pill').to.exist;
    expect(block.querySelectorAll('h1').length, 'no h1 (C8)').to.equal(0);
    expect(block.querySelectorAll('.jn-title').length, 'exactly one title').to.equal(1);

    // Background media preserved with its <picture> + lazy attrs (C4).
    const bg = block.querySelector('.jn-bg img.bg');
    expect(bg, 'background image kept').to.exist;
    expect(bg.getAttribute('loading')).to.equal('lazy');

    // Three jump links, each a real <a> with an icon tile, label, and daa-ll.
    const links = block.querySelectorAll('.jn-links .jn-link');
    expect(links.length, 'three jump links').to.equal(3);
    links.forEach((a) => {
      expect(a.tagName).to.equal('A');
      expect(a.getAttribute('href')).to.match(/^#/);
      expect(a.getAttribute('daa-ll'), 'analytics label').to.be.a('string').and.not.empty;
      expect(a.querySelector('.jn-ico svg'), 'chevron icon').to.exist;
      expect(a.querySelector('.jn-link-label'), 'link label').to.exist;
    });
  });
});
