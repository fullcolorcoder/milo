const BLOCK = 'forge-trust';

function buildTile(cell) {
  const article = document.createElement('article');
  article.className = 'etile';

  const picture = cell.querySelector('picture');
  const img = !picture ? cell.querySelector('img') : null;

  const picDiv = document.createElement('div');
  picDiv.className = 'pic';
  if (picture) picDiv.appendChild(picture);
  else if (img) picDiv.appendChild(img);
  article.appendChild(picDiv);

  const txtDiv = document.createElement('div');
  txtDiv.className = 'txt';

  const srcH = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (srcH) {
    const h = document.createElement('h3');
    h.className = 't-h6';
    h.textContent = srcH.textContent;
    txtDiv.appendChild(h);
  }

  [...cell.querySelectorAll('p')].forEach((p) => {
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

  // Row 0: heading row — first non-heading child is eyebrow, heading element becomes h2
  const headingCell = rows[0]?.querySelector(':scope > div');
  if (headingCell) {
    const theadDiv = document.createElement('div');
    theadDiv.className = 'thead';

    const srcEyebrow = [...headingCell.children].find(
      (c) => !c.matches('h1, h2, h3, h4, h5, h6'),
    );
    if (srcEyebrow) {
      const eb = document.createElement('span');
      eb.className = 'eb t-eyebrow';
      eb.textContent = srcEyebrow.textContent;
      theadDiv.appendChild(eb);
    }

    const srcH = headingCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (srcH) {
      const h = document.createElement('h2');
      h.className = 't-h2';
      h.innerHTML = srcH.innerHTML;
      theadDiv.appendChild(h);
    }

    rebuilt.push(theadDiv);
  }

  // Rows 1+: each cell in a row becomes one editorial tile
  const tilesDiv = document.createElement('div');
  tilesDiv.className = 'tiles';

  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i].querySelectorAll(':scope > div')];
    for (const cell of cells) {
      tilesDiv.appendChild(buildTile(cell));
    }
  }

  if (tilesDiv.children.length) rebuilt.push(tilesDiv);

  el.replaceChildren(...rebuilt);
  el.dataset.forgeAuthored = BLOCK;
}
