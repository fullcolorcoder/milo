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

  it('sets daa-lh on the block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-quote');
  });

  it('renders a blockquote with the quote text', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    await init(block);
    const bq = block.querySelector('blockquote');
    expect(bq, 'blockquote element present').to.exist;
    expect(bq.textContent.trim()).to.include('Creative Cloud Pro');
  });

  it('renders a figcaption with name and title spans', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    await init(block);
    const name = block.querySelector('figcaption .name');
    const title = block.querySelector('figcaption .title');
    expect(name, 'name span present').to.exist;
    expect(title, 'title span present').to.exist;
    expect(name.textContent.trim()).to.equal('Bart Simpson');
    expect(title.textContent.trim()).to.equal('Creative Director - HBO');
  });

  it('renders two decorative rails and two strips', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    await init(block);
    const rails = block.querySelectorAll('.quote-rail');
    const strips = block.querySelectorAll('.quote-strip');
    expect(rails.length, 'two rails').to.equal(2);
    expect(strips.length, 'two strips').to.equal(2);
  });

  it('renders four bombsite corner decorations', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-quote');
    await init(block);
    const bombsites = block.querySelectorAll('.bombsite');
    expect(bombsites.length, 'four bombsites').to.equal(4);
    expect(block.querySelector('.bs-tl'), 'top-left bombsite').to.exist;
    expect(block.querySelector('.bs-tr'), 'top-right bombsite').to.exist;
    expect(block.querySelector('.bs-bl'), 'bottom-left bombsite').to.exist;
    expect(block.querySelector('.bs-br'), 'bottom-right bombsite').to.exist;
  });
});
