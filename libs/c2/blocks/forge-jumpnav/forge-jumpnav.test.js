import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from './forge-jumpnav.js';

describe('forge-jumpnav', () => {
  it('exports a callable init(el)', () => {
    expect(init).to.be.a('function');
  });

  it('decorates the EDS-rendered block and stamps the forge marker', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jumpnav');
    expect(block, 'mock body has the block root').to.exist;
    await init(block);
    expect(block.dataset.forgeAuthored).to.equal('forge-jumpnav');
  });

  it('builds .bg with a picture element', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jumpnav');
    await init(block);
    const bg = block.querySelector('.bg');
    expect(bg, '.bg div exists').to.exist;
    expect(bg.querySelector('picture'), '.bg contains picture').to.exist;
  });

  it('builds .scrim overlay', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jumpnav');
    await init(block);
    expect(block.querySelector('.scrim'), '.scrim div exists').to.exist;
  });

  it('builds .inner with eyebrow and heading', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jumpnav');
    await init(block);
    const inner = block.querySelector('.inner');
    expect(inner, '.inner div exists').to.exist;
    expect(inner.querySelector('h2'), 'h2 inside .inner').to.exist;
    expect(inner.querySelector('.appid'), 'eyebrow .appid inside .inner').to.exist;
  });

  it('builds .jumps with decorated links', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jumpnav');
    await init(block);
    const jumps = block.querySelector('.jumps');
    expect(jumps, '.jumps div exists').to.exist;
    const links = jumps.querySelectorAll('a.jump');
    expect(links.length, '3 jump links').to.equal(3);
    links.forEach((a) => {
      expect(a.getAttribute('daa-ll'), 'link has daa-ll').to.be.a('string').and.not.empty;
      expect(a.querySelector('.jbtn'), 'link has .jbtn icon').to.exist;
    });
  });

  it('sets daa-lh on block root', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const block = document.querySelector('.forge-jumpnav');
    await init(block);
    expect(block.getAttribute('daa-lh')).to.equal('forge-jumpnav');
  });
});
