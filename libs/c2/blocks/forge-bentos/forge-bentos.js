const BLOCK = 'forge-bentos';

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) { el.dataset.forgeAuthored = BLOCK; return; }

  const frag = document.createDocumentFragment();

  // Row 0: section title (single-cell row)
  const titleCell = rows[0]?.querySelector(':scope > div');
  const titleSrc = titleCell?.querySelector('h1, h2, h3, h4, h5, h6');
  if (titleSrc) {
    titleSrc.classList.add('bentos-title', 't-title2');
    // Ensure it's an h2 (one h1 rule; title-level = h2)
    if (titleSrc.tagName !== 'H2') {
      const h2 = document.createElement('h2');
      h2.className = titleSrc.className;
      h2.innerHTML = titleSrc.innerHTML;
      frag.appendChild(h2);
    } else {
      frag.appendChild(titleSrc);
    }
  }

  // Rows 1+: bento cards — each EDS row = one card with [media-cell][copy-cell]
  const cardRows = rows.slice(1);

  if (cardRows.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'bento-grid';

    // Pair cards into visual rows of two
    for (let i = 0; i < cardRows.length; i += 2) {
      const bentoRow = document.createElement('div');
      bentoRow.className = 'bento-row';

      for (let j = i; j < Math.min(i + 2, cardRows.length); j++) {
        const cardEdsRow = cardRows[j];
        const cells = [...cardEdsRow.querySelectorAll(':scope > div')];

        const article = document.createElement('article');
        article.className = 'bento';

        // Media (first cell)
        const mediaDiv = document.createElement('div');
        mediaDiv.className = 'bento-media';
        const picture = cells[0]?.querySelector('picture');
        if (picture) {
          const img = picture.querySelector('img');
          if (img) img.setAttribute('daa-im', '1');
          mediaDiv.appendChild(picture);
        }
        article.appendChild(mediaDiv);

        // Copy (second cell)
        const copyDiv = document.createElement('div');
        copyDiv.className = 'bento-copy';
        const copyCell = cells[1];
        if (copyCell) {
          const headingSrc = copyCell.querySelector('h1, h2, h3, h4, h5, h6');
          if (headingSrc) {
            const h3 = document.createElement('h3');
            h3.className = 't-h6';
            h3.innerHTML = headingSrc.innerHTML;
            copyDiv.appendChild(h3);
          }
          const para = copyCell.querySelector('p');
          if (para) {
            para.classList.add('t-body-md', 'sub');
            copyDiv.appendChild(para);
          }
        }
        article.appendChild(copyDiv);
        bentoRow.appendChild(article);
      }

      grid.appendChild(bentoRow);
    }

    frag.appendChild(grid);
  }

  el.replaceChildren(frag);
  el.dataset.forgeAuthored = BLOCK;
}
