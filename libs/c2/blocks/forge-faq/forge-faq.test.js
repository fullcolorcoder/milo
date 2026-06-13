import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-faq.js';

describe('forge-faq', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the EDS-rendered block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-faq');
  });

  it('builds faq-head with h2 heading', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);
    const h2 = block.querySelector('.faq-head h2');
    expect(h2).to.exist;
    expect(h2.textContent).to.equal('Frequently asked questions');
  });

  it('builds faq-list with correct number of items', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);
    const items = block.querySelectorAll('.faq-item');
    expect(items.length).to.equal(4);
  });

  it('first item is expanded by default', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);
    const btns = block.querySelectorAll('.faq-q-btn');
    expect(btns[0].getAttribute('aria-expanded')).to.equal('true');
    expect(btns[1].getAttribute('aria-expanded')).to.equal('false');
  });

  it('first panel is open by default', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);
    const panels = block.querySelectorAll('.faq-panel');
    expect(panels[0].dataset.open).to.equal('true');
    expect(panels[1].dataset.open).to.equal('false');
  });

  it('toggles aria-expanded and data-open on button click', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);
    const btn = block.querySelector('.faq-q-btn');
    const panel = block.querySelector('.faq-panel');
    btn.click();
    expect(btn.getAttribute('aria-expanded')).to.equal('false');
    expect(panel.dataset.open).to.equal('false');
    btn.click();
    expect(btn.getAttribute('aria-expanded')).to.equal('true');
    expect(panel.dataset.open).to.equal('true');
  });

  it('each button has aria-controls pointing to its panel id', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);
    const btns = block.querySelectorAll('.faq-q-btn');
    btns.forEach((btn) => {
      const id = btn.getAttribute('aria-controls');
      expect(id).to.be.a('string');
      expect(block.querySelector(`#${id}`)).to.exist;
    });
  });

  it('sets daa-lh analytics attribute on root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-faq');
  });

  it('sets daa-ll on each question button', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);
    const btns = block.querySelectorAll('.faq-q-btn');
    btns.forEach((btn) => {
      expect(btn.getAttribute('daa-ll')).to.be.a('string').that.is.not.empty;
    });
  });
});
