const BLOCK = 'forge-usecase';

function copyMepAttrs(src, dest) {
  for (const { name, value } of src.attributes) {
    if (name === 'data-manifest-id' || name === 'data-adobe-target-testid' || name.startsWith('data-mep-')) {
      dest.setAttribute(name, value);
    }
  }
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) { el.dataset.forgeAuthored = BLOCK; return; }

  const frag = document.createDocumentFragment();
  let cardStart = 0;

  // Title row: single cell containing a heading
  const firstCells = [...rows[0].querySelectorAll(':scope > div')];
  if (firstCells.length === 1) {
    const headingSrc = firstCells[0].querySelector('h1, h2, h3, h4, h5, h6');
    if (headingSrc) {
      let titleEl = headingSrc;
      if (headingSrc.tagName !== 'H2') {
        const h2 = document.createElement('h2');
        h2.innerHTML = headingSrc.innerHTML;
        titleEl = h2;
      }
      titleEl.classList.add('usecase-title', 't-title3');
      frag.appendChild(titleEl);
      cardStart = 1;
    }
  }

  const cardRows = rows.slice(cardStart);

  if (cardRows.length) {
    const grid = document.createElement('div');
    grid.className = 'usecase-grid';

    for (let i = 0; i < cardRows.length; i += 2) {
      const bentoRow = document.createElement('div');
      bentoRow.className = 'bento-row';

      for (let j = i; j < Math.min(i + 2, cardRows.length); j++) {
        const cells = [...cardRows[j].querySelectorAll(':scope > div')];
        const article = document.createElement('article');
        article.className = 'bento';
        copyMepAttrs(cardRows[j], article);

        const mediaCell = cells[0];

        // App badge SVG authored in the media cell before the picture
        const badgeSvg = mediaCell?.querySelector('svg');
        if (badgeSvg) {
          const badgeSpan = document.createElement('span');
          badgeSpan.className = 'bento-badge';
          badgeSpan.setAttribute('aria-hidden', 'true');
          badgeSpan.appendChild(badgeSvg);
          article.appendChild(badgeSpan);
        }

        // Media picture
        const mediaDiv = document.createElement('div');
        mediaDiv.className = 'bento-media';
        const picture = mediaCell?.querySelector('picture');
        if (picture) {
          const img = picture.querySelector('img');
          if (img) img.setAttribute('daa-im', '1');
          mediaDiv.appendChild(picture);
        }
        article.appendChild(mediaDiv);

        // Copy
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
          copyCell.querySelectorAll('p').forEach((p) => {
            p.classList.add('t-body-md', 'sub');
            copyDiv.appendChild(p);
          });
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
