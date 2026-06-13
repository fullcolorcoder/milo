import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-roller.js';

describe('forge-roller', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates block into roller structure', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-roller');
    expect(block, 'block root exists').to.exist;

    await init(block);

    expect(block.dataset.forgeAuthored, 'forge marker set').to.equal('forge-roller');
    expect(block.getAttribute('daa-lh'), 'analytics handle').to.equal('forge-roller');

    // Background layer
    expect(block.querySelector('.bg'), 'bg layer present').to.exist;
    expect(block.querySelector('.bg .dim'), 'dim overlay present').to.exist;

    // Content wrapper with left + right columns
    const cw = block.querySelector('.cw');
    expect(cw, 'content wrapper present').to.exist;

    const left = cw.querySelector('.left');
    expect(left, 'left panel present').to.exist;

    const rhead = left.querySelector('.rhead');
    expect(rhead, 'rhead present').to.exist;
    expect(rhead.querySelector('.t-eyebrow'), 'eyebrow present').to.exist;
    expect(rhead.querySelector('.t-h2'), 't-h2 heading present').to.exist;
    expect(rhead.querySelector('.t-eyebrow').textContent.trim(), 'eyebrow text').to.equal('20+ apps included');

    const cwrap = left.querySelector('.cwrap');
    expect(cwrap, 'cwrap present').to.exist;
    expect(cwrap.querySelector('.cat'), 'category label present').to.exist;
    expect(cwrap.querySelector('.divider'), 'divider present').to.exist;

    const list = cwrap.querySelector('.list');
    expect(list, 'app list present').to.exist;
    const items = list.querySelectorAll('p');
    expect(items.length, 'app list has items').to.be.greaterThan(0);
    expect(items[0].classList.contains('active'), 'first item marked active').to.be.true;

    // Right panel: media card
    const right = cw.querySelector('.right');
    expect(right, 'right panel present').to.exist;
    expect(right.querySelector('.media'), 'media card present').to.exist;
    expect(right.querySelector('.media .pic'), 'pic wrapper present').to.exist;
    expect(right.querySelector('.media .pic picture'), 'picture inside pic').to.exist;
    expect(right.querySelector('.media .appicon'), 'app icon badge present').to.exist;
    expect(right.querySelector('.media .appicon').textContent.trim(), 'appicon text').to.equal('Ae');

    // L8: no h1 elements
    expect(block.querySelectorAll('h1').length, 'no h1 elements (L8)').to.equal(0);

    // C4: lazy loading preserved
    block.querySelectorAll('img').forEach((img) => {
      expect(img.getAttribute('loading'), 'lazy loading preserved').to.equal('lazy');
    });
  });

  it('is safe to call with null', async () => {
    await init(null);
  });
});
