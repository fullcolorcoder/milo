// Smoke + reconstruction fixture for the authored Milo block forge-usecase.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
// The mock body is the REAL class-less DA serialization (no authored .bento/
// .uc-row/.usecase classes), so these assertions prove init() REBUILDS the
// structure from content order (C24).
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-usecase.js';

describe('forge-usecase', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('rebuilds the bento grid from class-less DA content', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-usecase');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    // Stamped analytics + forge marker.
    expect(block.getAttribute('daa-lh')).to.equal('forge-usecase');
    expect(block.dataset.forgeAuthored).to.equal('forge-usecase');

    // Reconstructed scaffolding the scoped CSS keys on.
    const inner = block.querySelector('.usecase__inner');
    expect(inner, 'usecase__inner present').to.exist;
    expect(block.querySelector('.usecase__grid'), 'grid container present').to.exist;

    // Four content clusters → four bento tiles packed two-up into two rows.
    expect(block.querySelectorAll('.row-2').length, 'two rows of two').to.equal(2);
    expect(block.querySelectorAll('.bento').length, 'four bento tiles').to.equal(4);

    // Each tile has a reserved media box and a copy cluster (heading + body).
    block.querySelectorAll('.bento').forEach((tile) => {
      expect(tile.querySelector('.bento__img picture'), 'tile media moved into .bento__img').to.exist;
      expect(tile.querySelector('.bento__copy .bento__h'), 'tile heading present').to.exist;
      expect(tile.querySelector('.bento__copy .bento__b'), 'tile body present').to.exist;
    });

    // App-mnemonic badges reconstructed: one image badge + three text glyphs.
    const badges = block.querySelectorAll('.appicon');
    expect(badges.length, 'four mnemonic badges').to.equal(4);
    expect(block.querySelector('.appicon--firefly img'), 'image badge present').to.exist;
    expect(block.querySelector('.appicon--pr'), 'Pr brand modifier mapped').to.exist;
    expect(block.querySelector('.appicon--ae'), 'Ae brand modifier mapped').to.exist;
    expect(block.querySelector('.appicon--fi'), 'Fi brand modifier mapped').to.exist;

    // Exactly one section title, promoted to h2 (never h1) — C8.
    expect(block.querySelectorAll('h1').length, 'no h1').to.equal(0);
    expect(block.querySelector('.usecase__title').tagName).to.equal('H2');
    // Tile headings are h3, not extra h1/h2.
    expect(block.querySelectorAll('.bento__h')[0].tagName).to.equal('H3');

    // Inserted images carry the analytics marker (C7).
    block.querySelectorAll('.bento__img img').forEach((img) => {
      expect(img.getAttribute('daa-im'), 'daa-im on media').to.equal('true');
    });
  });
});
