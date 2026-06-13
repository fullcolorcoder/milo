const BLOCK = 'forge-concierge';

function createSendSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M8 13V3M4 7l4-4 4 4');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.6');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);
  return svg;
}

function createAiSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('fill', 'none');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.setAttribute('id', 'fc-ai-grad');
  grad.setAttribute('x1', '0%');
  grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%');
  grad.setAttribute('y2', '100%');
  const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  s1.setAttribute('offset', '0%');
  s1.setAttribute('stop-color', '#7155fa');
  const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  s2.setAttribute('offset', '100%');
  s2.setAttribute('stop-color', '#d92361');
  grad.appendChild(s1);
  grad.appendChild(s2);
  defs.appendChild(grad);
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 2c.4 4.8 2.8 7.2 7.6 7.6C14.8 10 12.4 12.4 12 17.2c-.4-4.8-2.8-7.2-7.6-7.6C9.2 9.2 11.6 6.8 12 2z');
  path.setAttribute('fill', 'url(#fc-ai-grad)');
  svg.appendChild(defs);
  svg.appendChild(path);
  return svg;
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const cell = (row) => row?.querySelector(':scope > div');

  // Row 0: heading
  const titleCell = cell(rows[0]);
  const titleText = (titleCell?.querySelector('h1,h2,h3,h4,h5,h6') || titleCell)?.textContent?.trim() || '';

  // Row 1: prompt placeholder
  const placeholder = cell(rows[1])?.textContent?.trim() || 'Ask anything';

  // Last row: legal text (identified by containing <a> links)
  const lastCell = cell(rows[rows.length - 1]);
  const legalCell = lastCell?.querySelector('a') ? lastCell : null;

  // Rows 2..N-1: suggestion chips
  const suggEnd = legalCell ? rows.length - 1 : rows.length;
  const suggestions = rows.slice(2, suggEnd)
    .map((r) => cell(r)?.textContent?.trim())
    .filter(Boolean);

  // ── DOM build ──────────────────────────────────────────────────────────────
  const inner = document.createElement('div');
  inner.className = 'concierge-inner';

  const heading = document.createElement('h2');
  heading.className = 'display-title-2 concierge-title';
  heading.textContent = titleText;
  inner.appendChild(heading);

  const promptDiv = document.createElement('div');
  promptDiv.className = 'prompt';

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'prompt-input';

  const inputRow = document.createElement('div');
  inputRow.className = 'prompt-input-row';

  const aiSpan = document.createElement('span');
  aiSpan.className = 'prompt-ai';
  aiSpan.setAttribute('aria-hidden', 'true');
  aiSpan.appendChild(createAiSvg());

  const promptInput = document.createElement('input');
  promptInput.type = 'text';
  promptInput.className = 'prompt-field body-md';
  promptInput.setAttribute('aria-label', placeholder);
  promptInput.setAttribute('placeholder', placeholder);

  const sendBtn = document.createElement('button');
  sendBtn.type = 'button';
  sendBtn.className = 'prompt-send';
  sendBtn.setAttribute('aria-label', 'Send');
  sendBtn.setAttribute('daa-ll', 'send');
  sendBtn.appendChild(createSendSvg());

  inputRow.appendChild(aiSpan);
  inputRow.appendChild(promptInput);
  inputRow.appendChild(sendBtn);
  inputWrapper.appendChild(inputRow);
  promptDiv.appendChild(inputWrapper);

  if (suggestions.length) {
    const sugDiv = document.createElement('div');
    sugDiv.className = 'suggestions';
    suggestions.forEach((text, i) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'suggestion body-sm';
      chip.textContent = text;
      chip.setAttribute('daa-ll', `suggestion-${i + 1}`);
      chip.addEventListener('click', () => {
        promptInput.value = text;
        promptInput.focus();
      });
      sugDiv.appendChild(chip);
    });
    promptDiv.appendChild(sugDiv);
  }

  inner.appendChild(promptDiv);

  if (legalCell) {
    const legal = document.createElement('p');
    legal.className = 'body-xs concierge-legal';
    [...legalCell.childNodes].forEach((n) => legal.appendChild(n.cloneNode(true)));
    legal.querySelectorAll('a').forEach((a) => {
      a.setAttribute('daa-ll', a.textContent.trim().slice(0, 30));
    });
    inner.appendChild(legal);
  }

  el.replaceChildren(inner);
  el.dataset.forgeAuthored = BLOCK;
}
