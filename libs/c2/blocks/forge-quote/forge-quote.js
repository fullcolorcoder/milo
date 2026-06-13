const BLOCK = 'forge-quote';

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // Extract content from EDS table rows (DA authoring: row1=quote, row2=name|role)
  const rows = [...el.querySelectorAll(':scope > div')];
  const quoteRow = rows[0];
  const byRow = rows[1];

  const quoteCell = quoteRow?.querySelector(':scope > div');
  const quoteText = quoteCell?.querySelector('p')?.textContent?.trim()
    || quoteCell?.textContent?.trim()
    || '';

  const nameCells = byRow ? [...byRow.querySelectorAll(':scope > div')] : [];
  const nameText = nameCells[0]?.textContent?.trim() || '';
  const roleText = nameCells[1]?.textContent?.trim() || '';

  // Build frame
  const frame = document.createElement('div');
  frame.className = 'frame';

  // Corner cross decorators
  ['tl', 'tr', 'bl', 'br'].forEach((pos) => {
    const x = document.createElement('span');
    x.className = `x ${pos}`;
    frame.appendChild(x);
  });

  const bq = document.createElement('blockquote');
  bq.textContent = quoteText;
  frame.appendChild(bq);

  const by = document.createElement('div');
  by.className = 'by t-body-md';

  const nameEl = document.createElement('p');
  nameEl.className = 'name';
  nameEl.textContent = nameText;
  by.appendChild(nameEl);

  const roleEl = document.createElement('p');
  roleEl.className = 'role';
  roleEl.textContent = roleText;
  by.appendChild(roleEl);

  frame.appendChild(by);

  el.replaceChildren(frame);
  el.dataset.forgeAuthored = BLOCK;
}
