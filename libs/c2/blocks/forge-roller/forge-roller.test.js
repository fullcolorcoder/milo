import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-roller.js';

describe('forge-roller', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the EDS-rendered block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-roller');
  });

  it('sets daa-lh on the block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-roller');
  });

  it('builds the two-column inner layout', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    await init(block);
    expect(block.querySelector('.roller-inner'), '.roller-inner present').to.exist;
    expect(block.querySelector('.roller-left'), '.roller-left present').to.exist;
    expect(block.querySelector('.roller-right'), '.roller-right present').to.exist;
  });

  it('renders the background picture and tint overlay', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    await init(block);
    expect(block.querySelector('picture'), 'background picture present').to.exist;
    expect(block.querySelector('.roller-bgtint'), 'tint overlay present').to.exist;
  });

  it('builds the headline with eyebrow and title classes', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    await init(block);
    const headline = block.querySelector('.roller-headline');
    expect(headline, '.roller-headline present').to.exist;
    expect(headline.querySelector('.t-eyebrow'), 't-eyebrow paragraph present').to.exist;
    expect(headline.querySelector('.t-title2'), 't-title2 heading present').to.exist;
  });

  it('renders no more than one h1', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    await init(block);
    const h1s = block.querySelectorAll('h1');
    expect(h1s.length, 'at most one h1').to.be.at.most(1);
  });

  it('builds the roller app list with correct item count', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    await init(block);
    const list = block.querySelector('.roller-list');
    expect(list, '.roller-list present').to.exist;
    // mock has 1 featured + 9 name-only apps = 10 items
    expect(list.children.length, '10 app items in list').to.equal(10);
  });

  it('marks the first featured app as active in the list', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    await init(block);
    const activeItems = block.querySelectorAll('.roller-list > div.active');
    expect(activeItems.length, 'exactly one active item').to.equal(1);
    expect(activeItems[0].textContent, 'After Effects is active').to.equal('After Effects');
  });

  it('renders the featured media slot in the right panel', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    await init(block);
    const media = block.querySelector('.roller-right .roller-media');
    expect(media, '.roller-media in right panel').to.exist;
    const img = media.querySelector('img');
    expect(img, 'image inside roller-media').to.exist;
    expect(img.getAttribute('loading'), 'lazy loading preserved').to.equal('lazy');
  });

  it('renders the app badge in the featured media slot', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    await init(block);
    const badge = block.querySelector('.roller-right .bento-badge');
    expect(badge, '.bento-badge present in right panel').to.exist;
    expect(badge.getAttribute('aria-hidden'), 'badge is aria-hidden').to.equal('true');
  });

  it('renders the category label', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    await init(block);
    const cat = block.querySelector('.roller-cat');
    expect(cat, '.roller-cat present').to.exist;
    expect(cat.textContent, 'category label text').to.equal('Video');
  });

  it('handles missing content rows without throwing', async () => {
    document.body.innerHTML = '<body><div class="forge-roller"><div><div>only one row</div></div></div></body>';
    const block = document.querySelector('.forge-roller');
    let threw = false;
    try { await init(block); } catch { threw = true; }
    expect(threw, 'no exception on sparse content').to.be.false;
    expect(block.dataset.forgeAuthored).to.equal('forge-roller');
  });
});
