const BLOCK = 'forge-trust';

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) { el.dataset.forgeAuthored = BLOCK; return; }

  const frag = document.createDocumentFragment();

  // Row 0: header — expects a single cell containing eyebrow (p) + headline (h2)
  const headerCell = rows[0]?.querySelector(':scope > div');
  if (headerCell) {
    const head = document.createElement('div');
    head.className = 'trust-head';

    const eyebrow = headerCell.querySelector('p');
    if (eyebrow) {
      eyebrow.classList.add('trust-eyebrow', 't-eyebrow');
      head.appendChild(eyebrow);
    }

    const headingSrc = headerCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (headingSrc) {
      let h2;
      if (headingSrc.tagName === 'H2') {
        h2 = headingSrc;
      } else {
        h2 = document.createElement('h2');
        h2.className = headingSrc.className;
        h2.innerHTML = headingSrc.innerHTML;
      }
      h2.classList.add('trust-headline', 't-title2');
      head.appendChild(h2);
    }

    frag.appendChild(head);
  }

  // Rows 1+: tile cards — two-cell rows [image cell][copy cell]
  const tileRows = rows.slice(1);
  if (tileRows.length) {
    const grid = document.createElement('div');
    grid.className = 'trust-grid';

    for (const row of tileRows) {
      const cells = [...row.querySelectorAll(':scope > div')];
      const article = document.createElement('article');
      article.className = 'trust-tile';

      const imgDiv = document.createElement('div');
      imgDiv.className = 'trust-img';
      const picture = cells[0]?.querySelector('picture');
      if (picture) {
        const img = picture.querySelector('img');
        if (img) img.setAttribute('daa-im', '1');
        imgDiv.appendChild(picture);
      }
      article.appendChild(imgDiv);

      const copyDiv = document.createElement('div');
      copyDiv.className = 'trust-copy';
      const copyCell = cells[1];
      if (copyCell) {
        const titleSrc = copyCell.querySelector('h1, h2, h3, h4, h5, h6');
        if (titleSrc) {
          const h3 = document.createElement('h3');
          h3.className = 't-h6';
          h3.innerHTML = titleSrc.innerHTML;
          copyDiv.appendChild(h3);
        }
        const para = copyCell.querySelector('p');
        if (para) {
          para.classList.add('t-body-md', 'sub');
          copyDiv.appendChild(para);
        }
      }
      article.appendChild(copyDiv);
      grid.appendChild(article);
    }

    frag.appendChild(grid);
  }

  el.replaceChildren(frag);
  el.dataset.forgeAuthored = BLOCK;
}
