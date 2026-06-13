const BLOCK = 'forge-quote';

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const cell = el.querySelector(':scope > div > div');
  if (!cell) return;

  const paras = [...cell.querySelectorAll('p')];
  const quoteText = paras[0]?.textContent?.trim() ?? '';
  const authorText = paras[1]?.textContent?.trim() ?? '';
  const citeText = paras[2]?.textContent?.trim() ?? '';

  const topLine = document.createElement('span');
  topLine.className = 'quote-line top';
  topLine.setAttribute('aria-hidden', 'true');

  const bottomLine = document.createElement('span');
  bottomLine.className = 'quote-line bottom';
  bottomLine.setAttribute('aria-hidden', 'true');

  const col = document.createElement('div');
  col.className = 'quote-col';

  ['tl', 'tr', 'bl', 'br'].forEach((pos) => {
    const cross = document.createElement('span');
    cross.className = `cross ${pos}`;
    cross.setAttribute('aria-hidden', 'true');
    col.appendChild(cross);
  });

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'display-title-1 quote-text';
  blockquote.textContent = quoteText;
  col.appendChild(blockquote);

  const attr = document.createElement('div');
  attr.className = 'quote-attr';

  const authorEl = document.createElement('p');
  authorEl.className = 'body-md author';
  authorEl.textContent = authorText;

  const citeEl = document.createElement('p');
  citeEl.className = 'body-md cite';
  citeEl.textContent = citeText;

  attr.appendChild(authorEl);
  attr.appendChild(citeEl);
  col.appendChild(attr);

  const rebuilt = document.createDocumentFragment();
  rebuilt.appendChild(topLine);
  rebuilt.appendChild(bottomLine);
  rebuilt.appendChild(col);

  el.replaceChildren(rebuilt);
  el.dataset.forgeAuthored = BLOCK;
}
