import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-faq.js';

describe('forge-faq', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates block and rebuilds FAQ accordion structure', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    expect(block, 'mock body has the block root').to.exist;

    await init(block);

    expect(block.dataset.forgeAuthored).to.equal('forge-faq');
    expect(block.getAttribute('daa-lh')).to.equal('forge-faq');
    expect(block.querySelector('.fhead'), '.fhead heading section rendered').to.exist;
    expect(block.querySelector('.fhead .t-h2'), '.t-h2 heading paragraph rendered').to.exist;
    expect(block.querySelector('.fhead .t-h2').textContent).to.equal('Frequently asked questions');
    expect(block.querySelectorAll('.acc').length).to.equal(4);
    expect(block.querySelector('.acc[open]'), 'first item open by default').to.exist;
    expect(block.querySelector('.acc .qrow'), '.qrow summary present').to.exist;
    expect(block.querySelector('.acc .qrow').getAttribute('daa-ll')).to.equal('faq-q1');
    expect(block.querySelector('.acc .q.t-faqq'), 'question span with classes').to.exist;
    expect(block.querySelector('.acc .ico'), 'icon span present').to.exist;
    expect(block.querySelector('.acc .ans'), 'answer paragraph present').to.exist;
  });

  it('is safe to call with null', async () => {
    await init(null);
  });
});
