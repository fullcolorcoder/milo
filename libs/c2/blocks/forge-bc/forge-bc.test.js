import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-bc.js';

describe('forge-bc', () => {
  beforeEach(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
  });

  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('stamps daa-lh and forge-authored marker', async () => {
    const block = document.querySelector('.forge-bc');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-bc');
    expect(block.dataset.forgeAuthored).to.equal('forge-bc');
  });

  it('builds container, prompt, input bar, chips, and disclaimer', async () => {
    const block = document.querySelector('.forge-bc');
    await init(block);
    expect(block.querySelector('.container')).to.exist;
    expect(block.querySelector('.prompt')).to.exist;
    expect(block.querySelector('.input')).to.exist;
    expect(block.querySelectorAll('.chip').length).to.equal(4);
    expect(block.querySelector('.disclaimer')).to.exist;
  });

  it('send button has daa-ll attribute', async () => {
    const block = document.querySelector('.forge-bc');
    await init(block);
    const send = block.querySelector('button.send');
    expect(send).to.exist;
    expect(send.getAttribute('daa-ll')).to.equal('send');
  });

  it('chip buttons have daa-ll attributes', async () => {
    const block = document.querySelector('.forge-bc');
    await init(block);
    const chips = [...block.querySelectorAll('button.chip')];
    expect(chips.length).to.equal(4);
    chips.forEach((chip, i) => {
      expect(chip.getAttribute('daa-ll')).to.equal(`chip-${i + 1}`);
    });
  });

  it('preserves authored heading text', async () => {
    const block = document.querySelector('.forge-bc');
    await init(block);
    const h2 = block.querySelector('h2');
    expect(h2).to.exist;
    expect(h2.textContent).to.include("Find what you're looking for");
  });

  it('preserves disclaimer links', async () => {
    const block = document.querySelector('.forge-bc');
    await init(block);
    const links = block.querySelectorAll('.disclaimer a');
    expect(links.length).to.equal(2);
  });
});
