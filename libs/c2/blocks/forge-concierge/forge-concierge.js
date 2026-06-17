/**
 * forge-concierge — a Milo C2 block authored by Forge for the "Find what you're
 * looking for." AI concierge band (Figma 392:15133): a dark, full-width,
 * centred section with a title, a rounded prompt-input pill (leading AI icon +
 * "Ask anything" placeholder + trailing send control), a wrap of suggestion
 * chips, and a fine-print legal paragraph with two links.
 *
 * DA serialises a block's content as a FLAT, class-LESS run of nodes in document
 * order — here: an <h2> title, the AI-icon <picture>, the bare "Ask anything"
 * placeholder text, the send-icon <picture>, the four suggestion lines (a single
 * newline-separated text run), then the legal <p>. The authored grid/pill/chip
 * wrappers and their classes DO NOT survive into runtime, so this decorator
 * PROBES the flat run by content shape (never by class), uses the trailing
 * send <picture> as the divider between the placeholder and the suggestions,
 * and REBUILDS the rich layout with createTag — a `.section-inner` holding the
 * `.concierge-title`, a `.concierge-prompt` (`.prompt-input` pill + `.concierge-sugs`
 * chip wrap) and the `.concierge-legal` fine print — stamping its own
 * `.forge-concierge`-scoped classes that the scoped stylesheet keys on.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). Do NOT "correct" this to 2 hops.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-concierge';

// MEP / personalization markers Milo stamps on the row/cell wrapper. The un-wrap
// discards that wrapper, so copy any present marker up onto the block root FIRST.
const MEP_ATTRS = ['data-manifest-id', 'data-adobe-target-testid'];
function preserveMepAttrs(from, to) {
  if (!from || !to) return;
  for (const attr of MEP_ATTRS) {
    const v = from.getAttribute?.(attr);
    if (v != null) to.setAttribute(attr, v);
  }
  for (const a of [...(from.attributes || [])]) {
    if (a.name.startsWith('data-mep-')) to.setAttribute(a.name, a.value);
  }
}

function createTag(tag, attrs = {}, content) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (content != null) {
    if (Array.isArray(content)) node.append(...content);
    else node.append(content);
  }
  return node;
}

function imgOf(node) {
  if (!node || node.nodeType !== 1) return null;
  return node.tagName === 'IMG' ? node : node.querySelector?.('img');
}

// A media node is a <picture>/<img>, or a wrapper whose only meaningful content
// is an image (no text). Probing by STRUCTURE keeps grouping identical in prod
// and in the data-URI test fixture.
function isMedia(node) {
  if (!node || node.nodeType !== 1) return false;
  if (node.matches('picture, img')) return true;
  return !!node.querySelector?.('picture, img')
    && !node.querySelector?.('h1, h2, h3, h4, h5, h6, p, ul, ol, a, button');
}

const clean = (s) => (s || '').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // Un-wrap the EDS row/cell so the flat authored run becomes the block's
  // children. Lift MEP markers off the discarded wrapper first.
  const inner = el.querySelector(':scope > div > div');
  if (inner) {
    preserveMepAttrs(inner.parentElement, el);
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  // Walk childNodes (DA serialises the inline placeholder + suggestion lines as
  // BARE text nodes, so element-only iteration would miss them).
  const ordered = [];
  for (const node of [...el.childNodes]) {
    if (node.nodeType === 3) {
      const t = clean(node.textContent);
      if (t) ordered.push({ kind: 'text', text: t });
    } else if (node.nodeType === 1) {
      ordered.push({ kind: 'el', node });
    }
  }

  const els = ordered.filter((o) => o.kind === 'el').map((o) => o.node);
  const title = els.find((n) => n.matches('h1, h2'));
  const legal = els.find((n) => n.matches('p') && n.querySelector('a'))
    || els.find((n) => n.matches('p'));
  const media = ordered.filter((o) => o.kind === 'el' && isMedia(o.node)).map((o) => o.node);
  const sendPic = media[1];
  const sendIdx = sendPic ? ordered.findIndex((o) => o.node === sendPic) : -1;

  // Collect text chunks (bare text + inline span/p that carry no link), tagging
  // each by whether it precedes the send divider (placeholder) or follows it
  // (suggestions). Multi-line suggestion runs are split on newline boundaries.
  const placeholderChunks = [];
  const suggestionChunks = [];
  ordered.forEach((item, idx) => {
    let text = null;
    if (item.kind === 'text') text = item.text;
    else if (item.node !== title && item.node !== legal && !isMedia(item.node)
      && item.node.matches('p, span, div') && !item.node.querySelector('a')) {
      text = clean(item.node.textContent);
    }
    if (!text) return;
    if (sendIdx >= 0 && idx > sendIdx) suggestionChunks.push(text);
    else placeholderChunks.push(text);
  });
  const placeholder = (placeholderChunks[0] || 'Ask anything').replace(/\n+/g, ' ');
  const sugSource = suggestionChunks.length ? suggestionChunks : placeholderChunks.slice(1);
  const suggestions = sugSource
    .flatMap((t) => t.split(/\n+/))
    .map((s) => s.trim())
    .filter(Boolean);

  // Build the reconstructed section ----------------------------------------
  const sectionInner = createTag('div', { class: 'section-inner' });

  if (title) {
    title.classList.add('t-title2', 'ink-white', 'concierge-title');
    sectionInner.append(title);
  }

  const prompt = createTag('div', { class: 'concierge-prompt' });

  // Prompt pill: leading icon + placeholder, trailing send control.
  const input = createTag('div', { class: 'prompt-input' });
  const piLeft = createTag('div', { class: 'pi-left' });
  if (media[0]) {
    const ico = createTag('span', { class: 'prompt-ico' });
    const img = imgOf(media[0]);
    img?.setAttribute('daa-im', 'true');
    img?.setAttribute('alt', '');
    ico.append(media[0]);
    piLeft.append(ico);
  }
  piLeft.append(createTag('span', { class: 't-body-md ink-subtle' }, placeholder));
  input.append(piLeft);
  if (sendPic) {
    const img = imgOf(sendPic);
    const label = (img?.getAttribute('alt') || 'Send').trim() || 'Send';
    const sendBtn = createTag('button', {
      type: 'button', class: 'prompt-send', 'aria-label': label,
    });
    sendBtn.setAttribute('daa-ll', 'Send');
    img?.setAttribute('daa-im', 'true');
    img?.setAttribute('alt', '');
    sendBtn.append(sendPic);
    input.append(sendBtn);
  }
  prompt.append(input);

  // Suggestion chips.
  if (suggestions.length) {
    const sugs = createTag('div', { class: 'concierge-sugs' });
    suggestions.forEach((text, i) => {
      const sug = createTag('span', { class: 'sug t-body-sm' }, text);
      sug.setAttribute('daa-ll', `suggestion-${i + 1}`);
      sugs.append(sug);
    });
    prompt.append(sugs);
  }
  sectionInner.append(prompt);

  // Legal fine print (links preserved + analytics-tagged).
  if (legal) {
    legal.classList.add('t-body-xs', 'concierge-legal');
    legal.querySelectorAll('a').forEach((a, i) => a.setAttribute('daa-ll', `legal-link-${i + 1}`));
    sectionInner.append(legal);
  }

  // Single commit — never wipe innerHTML; move-and-replace preserves DOM nodes
  // (and their MEP attributes) the rebuild reuses.
  el.replaceChildren(sectionInner);

  // Run Milo's own text decorator over the legal cluster for analytics + a11y
  // link wiring (typography is owned by the scoped CSS). Guarded so a service
  // hiccup never bricks the reconstructed section.
  try {
    const runText = (scope) => (scope || el)
      .querySelectorAll('.concierge-legal')
      .forEach((cluster) => decorateBlockText?.(cluster));
    if (typeof decorateViewportContent === 'function') decorateViewportContent(el, runText);
    else runText(el);
  } catch (e) {
    window.lana?.log?.(`${BLOCK} decorate: ${e?.message || e}`);
  }

  el.dataset.forgeAuthored = BLOCK;
}
