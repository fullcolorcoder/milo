const BLOCK = 'forge-usecase';

function buildBento(picCell, txtCell, isFull) {
  const article = document.createElement('article');
  article.className = isFull ? 'bento full' : 'bento';

  const picture = picCell?.querySelector('picture');
  const img = !picture && picCell?.querySelector('img');

  if (isFull) {
    // Full bento: picture fills the card, scrim overlay, text positioned at bottom
    if (picture) article.appendChild(picture);
    else if (img) article.appendChild(img);
    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    article.appendChild(scrim);
  } else {
    // Regular bento: .pic wrapper contains picture, .txt stacks below
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

  // Row 0: section heading (single cell, no picture)
  const headingCell = rows[0]?.querySelector(':scope > div');
  const srcH = headingCell?.querySelector('h1, h2, h3, h4, h5, h6, p');
  if (srcH) {
    const title = document.createElement('h3');
    title.className = 'uc-title t-h3';
    title.innerHTML = srcH.innerHTML;
    rebuilt.push(title);
  }

  // Rows 1+: bento cards — authored as 2-cell rows (pic | txt)
  const bentos = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i].querySelectorAll(':scope > div')];
    if (!cells.length) continue;
    const picCell = cells.find((c) => c.querySelector('picture, img'));
    const txtCell = cells.find((c) => c !== picCell) ?? cells[0];
    bentos.push({ picCell, txtCell });
  }

  if (bentos.length) {
    const grid = document.createElement('div');
    grid.className = 'grid';

    let i = 0;
    while (i < bentos.length) {
      const row = document.createElement('div');
      row.className = 'row';
      if (bentos.length - i === 1) {
        // Last unpaired bento becomes a full-width card with overlaid text
        const { picCell, txtCell } = bentos[i];
        row.appendChild(buildBento(picCell, txtCell, true));
        i += 1;
      } else {
        row.appendChild(buildBento(bentos[i].picCell, bentos[i].txtCell, false));
        row.appendChild(buildBento(bentos[i + 1].picCell, bentos[i + 1].txtCell, false));
        i += 2;
      }
      grid.appendChild(row);
    }

    rebuilt.push(grid);
  }

  el.replaceChildren(...rebuilt);
  el.dataset.forgeAuthored = BLOCK;
}
