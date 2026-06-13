import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-richcontent.js';

async function setup() {
  document.body.innerHTML = await readFile({ path: './mocks/body.html' });
  const block = document.querySelector('.forge-richcontent');
  await init(block);
  return block;
}

describe('forge-richcontent', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the EDS-rendered block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-richcontent');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-richcontent');
  });

  it('sets daa-lh analytics handle on the block root', async () => {
    const block = await setup();
    expect(block.getAttribute('daa-lh')).to.equal('forge-richcontent');
  });

  it('builds .rc-bg as a direct child containing the background picture', async () => {
    const block = await setup();
    const rcBg = block.querySelector(':scope > .rc-bg');
    expect(rcBg, '.rc-bg is a direct child of block root').to.exist;
    expect(rcBg.querySelector('picture'), '.rc-bg contains the background picture').to.exist;
  });

  it('builds .rc-scrim overlay as a direct child', async () => {
    const block = await setup();
    expect(block.querySelector(':scope > .rc-scrim'), '.rc-scrim is present').to.exist;
  });

  it('builds .rc-top as a direct child with eyebrow-row and headline', async () => {
    const block = await setup();
    const rcTop = block.querySelector(':scope > .rc-top');
    expect(rcTop, '.rc-top is a direct child of block root').to.exist;
    expect(rcTop.querySelector('.eyebrow-row'), '.eyebrow-row is inside .rc-top').to.exist;
    expect(rcTop.querySelector('.cc-badge'), '.cc-badge is inside .eyebrow-row').to.exist;
    const eyebrow = rcTop.querySelector('.eyebrow');
    expect(eyebrow?.textContent?.trim(), 'eyebrow text matches').to.equal('Creative Cloud Pro');
  });

  it('creates an h2 headline (not h1) with display-title-2 class', async () => {
    const block = await setup();
    const h2 = block.querySelector('.rc-headline');
    expect(h2, '.rc-headline is present').to.exist;
    expect(h2.tagName.toLowerCase(), 'headline is h2').to.equal('h2');
    expect(h2.classList.contains('display-title-2'), 'has display-title-2 class').to.be.true;
    expect(h2.textContent.trim(), 'headline text matches').to.equal(
      'Create better with apps that work together.',
    );
  });

  it('stamps daa-im on all images for analytics', async () => {
    const block = await setup();
    block.querySelectorAll('img').forEach((img) => {
      expect(img.hasAttribute('daa-im'), `${img.src} must have daa-im`).to.be.true;
    });
  });
});
