// Smoke + reconstruction fixture for the authored Milo block forge-richcontent.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// The mock body is the REAL class-less DA serialization (no authored .bg/.rc-*
// classes), so these assertions prove init() REBUILDS the structure (C24).
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-richcontent.js';

describe('forge-richcontent', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('rebuilds the section structure from class-less DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-richcontent');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    // Stamped analytics + forge marker.
    expect(block.getAttribute('daa-lh')).to.equal('forge-richcontent');
    expect(block.dataset.forgeAuthored).to.equal('forge-richcontent');

    // Reconstructed scaffolding the scoped CSS keys on.
    expect(block.querySelector('.bg picture'), 'background picture moved into .bg').to.exist;
    expect(block.querySelector('.scrim'), 'scrim present').to.exist;
    const inner = block.querySelector('.section-inner');
    expect(inner, 'section-inner present').to.exist;
    expect(inner.querySelector('.rc-top'), 'rc-top cluster present').to.exist;
    expect(inner.querySelector('.app-id .icon-cc'), 'app mnemonic icon present').to.exist;

    // Exactly one heading, promoted to h2 (never h1).
    expect(block.querySelectorAll('h1').length, 'no h1').to.equal(0);
    expect(block.querySelector('.rc-h2').tagName).to.equal('H2');

    // Jump-links rebuilt with icon button + label + analytics handle.
    const links = block.querySelectorAll('.rc-links .rc-link');
    expect(links.length, 'three jump-links').to.equal(3);
    links.forEach((a) => {
      expect(a.querySelector('.rc-iconbtn svg'), 'icon button svg').to.exist;
      expect(a.getAttribute('daa-ll'), 'daa-ll set').to.be.a('string').and.not.equal('');
    });
  });
});
