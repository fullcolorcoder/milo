// L22 test fixture for the authored Milo C2 block forge-faq.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-faq.js';

describe('forge-faq', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('un-wraps the EDS row/cell so the FAQ content sits directly under the block', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    expect(block.dataset.forgeAuthored).to.equal('forge-faq');
    expect(block.getAttribute('daa-lh')).to.equal('forge-faq');
    expect(block.querySelector(':scope > .faq__head'), 'head lifted').to.exist;
    expect(block.querySelector(':scope > .acc'), 'accordion lifted').to.exist;
  });

  it('renders a single h2 heading (no h1) and the full set of accordion items', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);

    expect(block.querySelectorAll('h1').length, 'no h1 in a section block').to.equal(0);
    expect(block.querySelectorAll('.faq__head h2').length).to.equal(1);
    expect(block.querySelectorAll('.acc .acc__item').length).to.equal(4);
    expect(block.querySelectorAll('.acc__item[open]').length, 'first item open').to.equal(1);
  });

  it('tags each accordion summary with a per-question analytics label', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);

    const rows = block.querySelectorAll('.acc__row');
    expect(rows.length).to.equal(4);
    rows.forEach((row) => {
      expect(row.getAttribute('daa-ll')).to.be.a('string').and.to.have.length.above(0);
    });
  });
});
