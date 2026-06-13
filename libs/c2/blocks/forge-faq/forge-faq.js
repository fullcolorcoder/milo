const BLOCK = 'forge-faq';

function toggleItem(btn, panel) {
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
  panel.dataset.open = String(!expanded);
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) { el.dataset.forgeAuthored = BLOCK; return; }

  const frag = document.createDocumentFragment();

  // Row 0: section heading (single-cell row)
  const headCell = rows[0]?.querySelector(':scope > div');
  const headingSrc = headCell?.querySelector('h1, h2, h3, h4, h5, h6');
  const headDiv = document.createElement('div');
  headDiv.className = 'faq-head';
  const h2 = document.createElement('h2');
  h2.className = 't-title2';
  h2.textContent = headingSrc?.textContent?.trim() || '';
  headDiv.appendChild(h2);
  frag.appendChild(headDiv);

  // Rows 1+: FAQ items — each EDS row = [question-cell][answer-cell]
  const listDiv = document.createElement('div');
  listDiv.className = 'faq-list';

  rows.slice(1).forEach((row, idx) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const questionText = cells[0]?.textContent?.trim() || '';
    const answerText = cells[1]?.textContent?.trim() || '';
    if (!questionText) return;

    const panelId = `faq-p${idx + 1}`;
    const isFirst = idx === 0;

    const item = document.createElement('div');
    item.className = 'faq-item';

    const btn = document.createElement('button');
    btn.className = 'faq-q-btn';
    btn.setAttribute('aria-expanded', String(isFirst));
    btn.setAttribute('aria-controls', panelId);
    btn.setAttribute('daa-ll', questionText.slice(0, 50));

    const qSpan = document.createElement('span');
    qSpan.className = 'q t-faq-q';
    qSpan.textContent = questionText;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'faq-icon';
    iconSpan.setAttribute('aria-hidden', 'true');

    btn.appendChild(qSpan);
    btn.appendChild(iconSpan);

    const panel = document.createElement('div');
    panel.className = 'faq-panel';
    panel.id = panelId;
    panel.dataset.open = String(isFirst);

    const answer = document.createElement('p');
    answer.className = 'faq-answer t-body-md';
    answer.textContent = answerText;
    panel.appendChild(answer);

    btn.addEventListener('click', () => toggleItem(btn, panel));

    item.appendChild(btn);
    item.appendChild(panel);
    listDiv.appendChild(item);
  });

  frag.appendChild(listDiv);
  el.replaceChildren(frag);
  el.dataset.forgeAuthored = BLOCK;
}
