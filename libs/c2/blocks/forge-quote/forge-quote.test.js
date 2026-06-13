import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-quote.js';

describe('forge-quote', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the EDS-rendered block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-quote');
  });

  it('sets daa-lh attribute on block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-quote');
  });

  it('builds blockquote with quote text', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    await init(block);
    const bq = block.querySelector('blockquote.quote-text');
    expect(bq, 'blockquote.quote-text exists').to.exist;
    expect(bq.textContent).to.include('Creative Cloud Pro');
  });

  it('builds author and cite attribution', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    await init(block);
    const author = block.querySelector('.quote-attr .author');
    expect(author, '.author exists').to.exist;
    expect(author.textContent).to.equal('Bart Simpson');
    const cite = block.querySelector('.quote-attr .cite');
    expect(cite, '.cite exists').to.exist;
    expect(cite.textContent).to.equal('Creative Director - HBO');
  });

  it('creates four corner cross decorations', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    await init(block);
    ['tl', 'tr', 'bl', 'br'].forEach((pos) => {
      expect(block.querySelector(`.cross.${pos}`), `.cross.${pos} exists`).to.exist;
    });
  });

  it('creates top and bottom quote-line spans', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    await init(block);
    expect(block.querySelector('.quote-line.top'), 'top line exists').to.exist;
    expect(block.querySelector('.quote-line.bottom'), 'bottom line exists').to.exist;
  });
});
