// Smoke + reconstruction fixture for the authored Milo block forge-bento.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-bento.js';

describe('forge-bento', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('rebuilds the bento layout from the flat DA cell', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-bento');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    // analytics + marker
    expect(block.getAttribute('daa-lh')).to.equal('forge-bento');
    expect(block.dataset.forgeAuthored).to.equal('forge-bento');

    // reconstructed structure (classes stamped by decorate, not by DA)
    const inner = block.querySelector('.forge-bento-inner');
    expect(inner, 'inner wrapper rebuilt').to.exist;

    // head: eyebrow + title
    const head = inner.querySelector('.forge-bento-head');
    expect(head, 'head rebuilt').to.exist;
    expect(head.querySelector('.forge-bento-eyebrow')).to.exist;
    expect(head.querySelector('h2.forge-bento-title')).to.exist;

    // feature: media + copy
    const feature = inner.querySelector('.forge-bento-feature');
    expect(feature, 'feature rebuilt').to.exist;
    expect(feature.querySelector('.forge-bento-feature-media picture')).to.exist;
    expect(feature.querySelector('.forge-bento-feature-copy h3')).to.exist;
    expect(feature.querySelector('.forge-bento-feature-copy p')).to.exist;

    // card row: exactly two cards
    const row = inner.querySelector('.forge-bento-row');
    expect(row, 'card row rebuilt').to.exist;
    const cards = row.querySelectorAll('.forge-bento-card');
    expect(cards.length, 'two cards').to.equal(2);

    // first card keeps its bare-text label
    const label = cards[0].querySelector('.forge-bento-card-label');
    expect(label, 'card label rebuilt').to.exist;
    expect(label.textContent.trim()).to.equal('Harmonize');

    // every card has media + heading + body
    cards.forEach((card) => {
      expect(card.querySelector('.forge-bento-card-media picture')).to.exist;
      expect(card.querySelector('h3')).to.exist;
      expect(card.querySelector('p')).to.exist;
    });

    // media preserved (move, not serialize): loading + daa-im wired
    const imgs = block.querySelectorAll('img');
    expect(imgs.length).to.equal(3);
    imgs.forEach((img) => {
      expect(img.getAttribute('loading')).to.equal('lazy');
      expect(img.getAttribute('daa-im')).to.equal('true');
    });

    // at most one h1 (there should be none here)
    expect(block.querySelectorAll('h1').length).to.be.at.most(1);
  });
});
