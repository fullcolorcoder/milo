const BLOCK = 'forge-bc';

const AI_ICON = '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 2l1.8 5.2L18 9l-5.2 1.8L11 16l-1.8-5.2L4 9l5.2-1.8z" fill="currentColor"></path><circle cx="17.5" cy="4.5" r="1.6" fill="currentColor"></circle></svg>';

const SEND_ICON = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="rgba(255,255,255,0.25)"></circle><path d="M10 6v8M10 6l3 3M10 6L7 9" stroke="#fff" stroke-width="1.4"></path></svg>';

// Authored rows: row[0] = heading, row[1] = chips (multi-cell), row[2] = disclaimer
function parseRows(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  return {
    headingCell: rows[0]?.querySelector(':scope > div') ?? null,
    chipsRow: rows[1] ?? null,
    disclaimerCell: rows[2]?.querySelector(':scope > div') ?? null,
  };
}

function buildInputBar() {
  const bar = document.createElement('div');
  bar.className = 'input';

  const aiSpan = document.createElement('span');
  aiSpan.className = 'ai';
  aiSpan.setAttribute('aria-hidden', 'true');
  aiSpan.innerHTML = AI_ICON;

  const ph = document.createElement('span');
  ph.className = 'ph t-body-md';
  ph.textContent = 'Ask anything';

  const send = document.createElement('button');
  send.className = 'send';
  send.setAttribute('type', 'button');
  send.setAttribute('aria-label', 'Send message');
  send.setAttribute('daa-ll', 'send');
  send.innerHTML = SEND_ICON;

  bar.append(aiSpan, ph, send);
  return bar;
}

function buildChips(chipsRow) {
  const cells = [...chipsRow.querySelectorAll(':scope > div')];
  if (!cells.length) return null;

  const container = document.createElement('div');
  container.className = 'chips';

  cells.forEach((cell, idx) => {
    const chip = document.createElement('button');
    chip.className = 'chip t-body-sm';
    chip.setAttribute('type', 'button');
    chip.setAttribute('daa-ll', `chip-${idx + 1}`);
    chip.textContent = cell.textContent.trim();
    container.appendChild(chip);
  });

  return container;
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const { headingCell, chipsRow, disclaimerCell } = parseRows(el);

  const heading = headingCell?.querySelector('h1, h2, h3, h4') ?? null;
  const disclaimerP = disclaimerCell?.querySelector('p') ?? null;

  const container = document.createElement('div');
  container.className = 'container';

  if (heading) {
    heading.classList.add('t-h2');
    container.appendChild(heading);
  }

  const prompt = document.createElement('div');
  prompt.className = 'prompt';
  prompt.appendChild(buildInputBar());

  if (chipsRow) {
    const chips = buildChips(chipsRow);
    if (chips) prompt.appendChild(chips);
  }

  container.appendChild(prompt);

  if (disclaimerP) {
    disclaimerP.classList.add('disclaimer', 't-body-xs');
    container.appendChild(disclaimerP);
  }

  el.replaceChildren(container);
  el.dataset.forgeAuthored = BLOCK;
}
