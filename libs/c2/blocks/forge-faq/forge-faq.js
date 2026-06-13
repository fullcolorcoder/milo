const BLOCK = 'forge-faq';

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // EDS renders each DA table row as: block > div(row) > div(cell) > content
  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const parts = [];

  // Row 0 → section heading (.fhead)
  const headCell = rows[0]?.querySelector(':scope > div');
  if (headCell) {
    const fhead = document.createElement('div');
    fhead.className = 'fhead';
    const heading = headCell.querySelector('h2, h3, p');
    const p = document.createElement('p');
    p.className = 't-h2';
    p.textContent = (heading || headCell).textContent.trim();
    fhead.appendChild(p);
    parts.push(fhead);
  }

  // Rows 1+ → accordion items (.acc)
  rows.slice(1).forEach((row, idx) => {
    const cells = row.querySelectorAll(':scope > div');
    const qCell = cells[0];
    const aCell = cells[1];
    if (!qCell) return;

    const details = document.createElement('details');
    details.className = 'acc';
    if (idx === 0) details.setAttribute('open', '');

    const summary = document.createElement('summary');
    summary.className = 'qrow';
    summary.setAttribute('daa-ll', `faq-q${idx + 1}`);

    const qSpan = document.createElement('span');
    qSpan.className = 'q t-faqq';
    qSpan.textContent = qCell.textContent.trim();

    const icoSpan = document.createElement('span');
    icoSpan.className = 'ico';
    icoSpan.setAttribute('aria-hidden', 'true');

    summary.appendChild(qSpan);
    summary.appendChild(icoSpan);
    details.appendChild(summary);

    const ansPara = document.createElement('p');
    ansPara.className = 'ans t-body-md';
    if (aCell) {
      while (aCell.firstChild) ansPara.appendChild(aCell.firstChild);
    }
    details.appendChild(ansPara);

    parts.push(details);
  });

  el.replaceChildren(...parts);
  el.dataset.forgeAuthored = BLOCK;
}
