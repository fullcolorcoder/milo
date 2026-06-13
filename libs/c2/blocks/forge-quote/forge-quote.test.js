// Smoke fixture for the authored Milo block forge-quote.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-quote.js';

describe('forge-quote', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('rebuilds the testimonial structure and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    expect(block.dataset.forgeAuthored).to.equal('forge-quote');
    expect(block.getAttribute('daa-lh')).to.equal('forge-quote');

    // Two ruled side panels flank the centered box.
    expect(block.querySelectorAll(':scope > .side').length).to.equal(2);

    const box = block.querySelector(':scope > .box');
    expect(box, 'centered box').to.exist;

    // Four crosshair corner marks.
    expect(box.querySelectorAll('.mark').length).to.equal(4);

    // The quote text is carried into the blockquote.
    const quote = box.querySelector('blockquote.t-title1');
    expect(quote, 'blockquote').to.exist;
    expect(quote.textContent).to.contain('Creative Cloud Pro');

    // Attribution name + role.
    expect(box.querySelector('.attr .name').textContent).to.equal('Bart Simpson');
    expect(box.querySelector('.attr .role').textContent).to.equal('Creative Director - HBO');
  });
});
