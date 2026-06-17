// Smoke + reconstruction fixture for the authored Milo block forge-plans.
// Runs under Milo's @web/test-runner (browser); the ship gate scopes to
// libs/c2/blocks/forge-*/**/*.test.js, so a forge block gates on ITS own test.
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-plans.js';

describe('forge-plans', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('rebuilds the plans layout from the flat DA cell', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-plans');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);

    // analytics + marker
    expect(block.getAttribute('daa-lh')).to.equal('forge-plans');
    expect(block.dataset.forgeAuthored).to.equal('forge-plans');

    // reconstructed wrapper + head (classes stamped by decorate, not by DA)
    const inner = block.querySelector('.section-inner');
    expect(inner, 'inner wrapper rebuilt').to.exist;
    const title = inner.querySelector('h2.t-title2');
    expect(title, 'title rebuilt').to.exist;
    expect(title.textContent.trim()).to.equal('Choose a plan.');

    // tab pill group: three tabs, first active
    const tabs = inner.querySelectorAll('.plan-tabs .plan-tab');
    expect(tabs.length, 'three audience tabs').to.equal(3);
    expect(tabs[0].classList.contains('is-active')).to.equal(true);
    expect(tabs[0].getAttribute('aria-selected')).to.equal('true');
    expect(tabs[2].textContent.trim()).to.equal('Businesses');

    // exactly two cards: a dark one and a light/featured one
    const cards = inner.querySelectorAll('.plan-cards .plan-card');
    expect(cards.length, 'two plan cards').to.equal(2);
    const dark = inner.querySelector('.plan-card.dark');
    const light = inner.querySelector('.plan-card.light');
    expect(dark, 'dark card rebuilt').to.exist;
    expect(light, 'light card rebuilt').to.exist;

    // dark card: eyebrow (mnemonic + label), title, single price, outline CTA
    expect(dark.querySelector('.plan-eyebrow .plan-mnemonic picture')).to.exist;
    expect(dark.querySelector('.plan-eyebrow img').getAttribute('daa-im')).to.equal('true');
    expect(dark.querySelector('h3.t-plantitle').textContent.trim()).to.equal('Photoshop');
    expect(dark.querySelector('.plan-price').textContent).to.contain('US$22.99');
    const darkCta = dark.querySelector('.plan-cta');
    expect(darkCta.classList.contains('btn-outline-light')).to.equal(true);
    expect(dark.querySelector('.plan-secure')).to.exist;

    // light card: see-terms, strikethrough old price + current price, accent CTA
    expect(light.querySelector('.plan-see').textContent.trim()).to.equal('See terms');
    expect(light.querySelector('.plan-price-old').textContent).to.contain('US$69.99');
    expect(light.querySelector('.plan-price').textContent).to.contain('US$34.99');
    const lightCta = light.querySelector('.plan-cta');
    expect(lightCta.classList.contains('btn-accent')).to.equal(true);
    // hash modifier consumed for styling, not left dangling on the href
    expect(lightCta.getAttribute('href')).to.not.contain('#_button-fill');

    // feature groups: three per card, each with a head + list
    expect(dark.querySelectorAll('.plan-feats .feat-group').length).to.equal(3);
    expect(light.querySelectorAll('.plan-feats .feat-group').length).to.equal(3);
    expect(dark.querySelector('.feat-group .feat-head').textContent).to.contain('Apps');
    expect(dark.querySelector('.feat-group ul li')).to.exist;

    // footer button
    const allBtn = inner.querySelector('.plans-allbtn');
    expect(allBtn, 'see-all-plans button rebuilt').to.exist;
    expect(allBtn.textContent.trim()).to.equal('See all plans');

    // single <h1> rule: this section uses h2/h3 only
    expect(block.querySelectorAll('h1').length).to.equal(0);
  });
});
