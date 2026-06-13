const BLOCK = 'forge-quote';

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const rows = [...el.querySelectorAll(':scope > div')];

  // Row 0: quote text, Row 1: author name, Row 2: author title
  const quoteText = rows[0]?.querySelector(':scope > div')?.textContent?.trim() ?? '';
  const nameText = rows[1]?.querySelector(':scope > div')?.textContent?.trim() ?? '';
  const titleText = rows[2]?.querySelector(':scope > div')?.textContent?.trim() ?? '';

  const frag = document.createDocumentFragment();

  const railL = document.createElement('div');
  railL.className = 'quote-rail';
  railL.setAttribute('aria-hidden', 'true');

  const center = document.createElement('div');
  center.className = 'quote-center';

  const stripTop = document.createElement('div');
  stripTop.className = 'quote-strip';
  stripTop.setAttribute('aria-hidden', 'true');

  const figure = document.createElement('figure');
  figure.className = 'quote-copy';

  for (const cls of ['bs-tl', 'bs-tr', 'bs-bl', 'bs-br']) {
    const bomb = document.createElement('span');
    bomb.className = `bombsite ${cls}`;
    bomb.setAttribute('aria-hidden', 'true');
    figure.appendChild(bomb);
  }

  const bq = document.createElement('blockquote');
  bq.className = 't-title1';
  bq.textContent = quoteText;
  figure.appendChild(bq);

  const caption = document.createElement('figcaption');
  caption.className = 'quote-attr t-body-md';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'name';
  nameSpan.textContent = nameText;

  const titleSpan = document.createElement('span');
  titleSpan.className = 'title';
  titleSpan.textContent = titleText;

  caption.appendChild(nameSpan);
  caption.appendChild(titleSpan);
  figure.appendChild(caption);

  const stripBot = document.createElement('div');
  stripBot.className = 'quote-strip';
  stripBot.setAttribute('aria-hidden', 'true');

  center.appendChild(stripTop);
  center.appendChild(figure);
  center.appendChild(stripBot);

  const railR = document.createElement('div');
  railR.className = 'quote-rail';
  railR.setAttribute('aria-hidden', 'true');

  frag.appendChild(railL);
  frag.appendChild(center);
  frag.appendChild(railR);

  el.replaceChildren(frag);
  el.dataset.forgeAuthored = BLOCK;
}
