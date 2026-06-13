const BLOCK = 'forge-usecase-6';

function buildBento(picCell, txtCell, isFull) {
  const article = document.createElement('article');
  article.className = isFull ? 'bento full' : 'bento';

  const picture = picCell?.querySelector('picture');
  const img = !picture && picCell?.querySelector('img');

  if (isFull) {
    if (picture) article.appendChild(picture);
    else if (img) article.appendChild(img);
    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    article.appendChild(scrim);
  } else {
    const picDiv = document.createElement('div');
    picDiv.className = 'pic';
    if (picture) picDiv.appendChild(picture);
    else if (img) picDiv.appendChild(img);
    article.appendChild(picDiv);
  }

  const txtDiv = document.createElement('div');
  txtDiv.className = 'txt';

  const cardH = txtCell?.querySelector('h1, h2, h3, h4, h5, h6');
  if (cardH) {
    const h = document.createElement('h3');
    h.className = 't-h6';
    h.innerHTML = cardH.innerHTML;
    txtDiv.appendChild(h);
  }

  [...(txtCell?.querySelectorAll('p') ?? [])].forEach((p) => {
    p.classList.add('t-body-md');
    txtDiv.appendChild(p);
  });

  article.appendChild(txtDiv);
  return article;
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) {
    el.dataset.forgeAuthored = BLOCK;
    return;
  }

  const rebuilt = [];

  // Row 0: section heading
  const headingCell = rows[0]?.querySelector(':scope > div');
  const srcH = headingCell?.querySelector('h1, h2, h3, h4, h5, h6, p');
  if (srcH) {
    const title = document.createElement('h3');
    title.className = 'uc-title t-h3';
    title.innerHTML = srcH.innerHTML;
    rebuilt.push(title);
  }

  // Rows 1+: bento cards.
  // A single-cell row signals a full-width bento (pic + txt authored in one cell).
  // A two-cell row is a regular bento (pic cell | txt cell).
  const bentos = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i].querySelectorAll(':scope > div')];
    if (!cells.length) continue;
    if (cells.length === 1) {
      bentos.push({ picCell: cells[0], txtCell: cells[0], full: true });
    } else {
      const picCell = cells.find((c) => c.querySelector('picture, img'));
      const txtCell = cells.find((c) => c !== picCell) ?? cells[0];
      bentos.push({ picCell, txtCell, full: false });
    }
  }

  if (bentos.length) {
    const grid = document.createElement('div');
    grid.className = 'grid';

    let i = 0;
    while (i < bentos.length) {
      const row = document.createElement('div');
      row.className = 'row';
      if (bentos[i].full) {
        row.appendChild(buildBento(bentos[i].picCell, bentos[i].txtCell, true));
        i += 1;
      } else if (i + 1 < bentos.length && !bentos[i + 1].full) {
        row.appendChild(buildBento(bentos[i].picCell, bentos[i].txtCell, false));
        row.appendChild(buildBento(bentos[i + 1].picCell, bentos[i + 1].txtCell, false));
        i += 2;
      } else {
        // Lone regular card — promote to full-width
        row.appendChild(buildBento(bentos[i].picCell, bentos[i].txtCell, true));
        i += 1;
      }
      grid.appendChild(row);
    }

    rebuilt.push(grid);
  }

  el.replaceChildren(...rebuilt);
  el.dataset.forgeAuthored = BLOCK;
}
