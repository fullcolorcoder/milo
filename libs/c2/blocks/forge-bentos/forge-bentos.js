const BLOCK = 'forge-bentos';

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // EDS renders each DA table row as: block > div(row) > div(cell) > content
  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) {
    el.dataset.forgeAuthored = BLOCK;
    return;
  }

  const rebuilt = [];

  // Row 0: section heading → h2.title.t-h2
  const headingCell = rows[0]?.querySelector(':scope > div');
  const srcH = headingCell?.querySelector('h1, h2, h3, h4, h5, h6, p');
  if (srcH) {
    const title = document.createElement('h2');
    title.className = 'title t-h2';
    title.innerHTML = srcH.innerHTML;
    rebuilt.push(title);
  }

  // Rows 1+: one bento card per authored row (pic cell | txt cell)
  const bentos = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i].querySelectorAll(':scope > div')];
    if (!cells.length) continue;

    const picCell = cells.find((c) => c.querySelector('picture, img'));
    const txtCell = cells.find((c) => c !== picCell) ?? picCell;
    if (!picCell && !txtCell) continue;

    const article = document.createElement('article');
    article.className = 'bento';

    // Image area — move the whole <picture> to preserve <source> and <img> attributes
    if (picCell) {
      const picDiv = document.createElement('div');
      picDiv.className = 'pic';
      const picture = picCell.querySelector('picture');
      if (picture) {
        picDiv.appendChild(picture);
      } else {
        const img = picCell.querySelector('img');
        if (img) picDiv.appendChild(img);
      }
      article.appendChild(picDiv);
    }

    // Text area — heading + body paragraphs
    const txtDiv = document.createElement('div');
    txtDiv.className = 'txt';

    const cardH = txtCell.querySelector('h1, h2, h3, h4, h5, h6');
    const cardBold = !cardH && txtCell.querySelector('p strong, p b');

    if (cardH) {
      const h3 = document.createElement('h3');
      h3.className = 't-h6';
      h3.innerHTML = cardH.innerHTML;
      cardH.remove();
      txtDiv.appendChild(h3);
    } else if (cardBold) {
      const h3 = document.createElement('h3');
      h3.className = 't-h6';
      h3.textContent = cardBold.textContent;
      cardBold.closest('p').remove();
      txtDiv.appendChild(h3);
    }

    [...txtCell.querySelectorAll('p')].forEach((p) => {
      p.classList.add('t-body-md');
      txtDiv.appendChild(p);
    });

    article.appendChild(txtDiv);
    bentos.push(article);
  }

  // Pair bentos into visual grid rows of 2
  if (bentos.length) {
    const grid = document.createElement('div');
    grid.className = 'grid';
    for (let i = 0; i < bentos.length; i += 2) {
      const row = document.createElement('div');
      row.className = 'row';
      row.appendChild(bentos[i]);
      if (bentos[i + 1]) row.appendChild(bentos[i + 1]);
      grid.appendChild(row);
    }
    rebuilt.push(grid);
  }

  el.replaceChildren(...rebuilt);
  el.dataset.forgeAuthored = BLOCK;
}
