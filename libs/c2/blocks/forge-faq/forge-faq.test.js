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
    expect(block.getAttribute('daa-lh')).to.equal('forge-faq');
  });

  it('wires accordion toggle on faq-q buttons', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);
    const btn = block.querySelector('.faq-q');
    expect(btn).to.exist;
    const initial = btn.getAttribute('aria-expanded');
    btn.click();
    const toggled = btn.getAttribute('aria-expanded');
    expect(toggled).to.not.equal(initial);
    btn.click();
    expect(btn.getAttribute('aria-expanded')).to.equal(initial);
  });

  it('stamps daa-ll on faq buttons', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-faq');
    await init(block);
    const btns = block.querySelectorAll('.faq-q');
    btns.forEach((btn) => {
      expect(btn.hasAttribute('daa-ll'), 'every faq-q has daa-ll').to.be.true;
    });
  });
});
