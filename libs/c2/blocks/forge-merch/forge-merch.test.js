// L22 test fixture for the authored Milo C2 block forge-merch.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-merch.js';

describe('forge-merch', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('un-wraps the EDS row/cell so merch sections sit directly under the block', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-merch');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    expect(block.dataset.forgeAuthored).to.equal('forge-merch');
    expect(block.getAttribute('daa-lh')).to.equal('forge-merch');
    expect(block.querySelector(':scope > .merch__copy'), 'merch__copy lifted').to.exist;
    expect(block.querySelector(':scope > .merch__img'), 'merch__img lifted').to.exist;
    expect(block.querySelector(':scope > .merch__quote'), 'merch__quote lifted').to.exist;
  });

  it('keeps zero h1 / one h2 and renders the framed quote with four corner marks', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-merch');
    await init(block);

    expect(block.querySelectorAll('h1').length, 'no h1 in this section').to.equal(0);
    expect(block.querySelectorAll('h2').length, 'single h2').to.equal(1);
    expect(block.querySelectorAll('.quote__frame .bombsite').length).to.equal(4);
    expect(block.querySelector('.quote__attr .name').textContent).to.equal('Bart Simpson');
  });

  it('tags the real-navigation CTAs as analytics anchors (not buttons)', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-merch');
    await init(block);

    const ctas = block.querySelectorAll('.merch__btns a');
    expect(ctas.length).to.equal(2);
    expect(ctas[0].tagName).to.equal('A');
    expect(ctas[0].getAttribute('href')).to.equal('https://www.adobe.com/creativecloud.html');
    expect(ctas[0].getAttribute('daa-ll')).to.equal('Free trial');
    expect(ctas[1].getAttribute('daa-ll')).to.equal('Compare plans');
  });

  it('preserves authored image attributes and tags them for analytics', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-merch');
    await init(block);

    const merchImg = block.querySelector('.merch__img img');
    expect(merchImg.getAttribute('loading')).to.equal('lazy');
    expect(merchImg.getAttribute('daa-im')).to.equal('true');
    expect(block.querySelector('.eyebrow .cc').getAttribute('width')).to.equal('24');
  });
});
