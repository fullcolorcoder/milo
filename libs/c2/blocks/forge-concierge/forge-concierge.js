/**
 * forge-concierge — a Milo C2 "brand concierge" prompt section (dark variant).
 *
 * Renders a centered heading above an AI-prompt input bar (decorative spark +
 * send glyphs framing a placeholder), a wrap of tappable suggestion pills, and a
 * legal disclaimer carrying the real Privacy/GenAI-Terms links. The scoped
 * stylesheet keys on the authored class names (`.cwrap`, `.prompt`, `.input`,
 * `.spark`, `.ph`, `.send`, `.sugg`, `.pill`, `.disc` + the `t-*` type classes),
 * so this decorator reads the DA-authored content (heading, placeholder, pill
 * texts, disclaimer paragraphs) and rebuilds that exact structure with
 * createElement, then swaps it in once with replaceChildren — never an innerHTML
 * wipe, which would drop Target/MEP/authored DOM.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). The 3-hop '../../../' form is CORRECT.
import { decorateBlockText } from '../../../utils/decorate.js';

const BLOCK = 'forge-concierge';
const SVGNS = 'http://www.w3.org/2000/svg';

// MEP / personalization markers Milo stamps on the row/cell wrapper. We discard
// those wrappers when rebuilding, so copy any present marker onto the block root
// first — a swap that drops them silently disables Target/MEP on the section.
const MEP_ATTRS = ['data-manifest-id', 'data-adobe-target-testid'];
function preserveMepAttrs(from, to) {
  if (!from || !to) return;
  for (const attr of MEP_ATTRS) {
    const v = from.getAttribute?.(attr);
    if (v != null) to.setAttribute(attr, v);
  }
  // data-mep-* is an open family — copy every attribute in that namespace.
  for (const a of [...(from.attributes || [])]) {
    if (a.name.startsWith('data-mep-')) to.setAttribute(a.name, a.value);
  }
}

function tag(name, className, text) {
  const node = document.createElement(name);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function svg(name, attrs) {
  const node = document.createElementNS(SVGNS, name);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function buildSpark() {
  const s = svg('svg', { width: '24', height: '24', viewBox: '0 0 24 24' });
  s.append(svg('path', {
    d: 'M12 2l1.8 5.6L19.5 9l-4.6 3.3L16.5 18 12 14.6 7.5 18l1.6-5.7L4.5 9l5.7-1.4z',
    fill: '#972ee3',
  }));
  return s;
}

function buildSend() {
  const s = svg('svg', { width: '32', height: '32', viewBox: '0 0 32 32' });
  s.append(svg('circle', {
    cx: '16', cy: '16', r: '15', fill: 'none', stroke: 'rgba(255,255,255,0.4)',
  }));
  s.append(svg('path', {
    d: 'M16 22V10M16 10l-5 5M16 10l5 5', stroke: '#fff', 'stroke-width': '1.6', fill: 'none',
  }));
  return s;
}

function iconSpan(className, glyph) {
  const span = tag('span', className);
  span.setAttribute('aria-hidden', 'true');
  span.append(glyph);
  return span;
}

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Probe outward for the authored content — never positional el.children[N],
  // authors rearrange rows.
  const rows = [...el.querySelectorAll(':scope > div')];
  preserveMepAttrs(rows[0]?.firstElementChild || rows[0], el);

  // Heading: an authored h2/h3 wins (never an h1 — keeps the block at ≤1 h1).
  const headingSrc = el.querySelector('h1, h2, h3, .t-title2');
  const headingText = headingSrc ? headingSrc.textContent.trim() : '';

  // Disclaimer paragraphs are the ones carrying links; the placeholder is the
  // first link-free paragraph. Tolerate either being absent.
  const paras = [...el.querySelectorAll('p')];
  const discParas = paras.filter((p) => p.querySelector('a'));
  const placeholder = paras.find((p) => !p.querySelector('a'))?.textContent.trim()
    || 'Ask anything';

  // Suggestion pills: authored as list items.
  const pills = [...el.querySelectorAll('li')]
    .map((li) => li.textContent.trim())
    .filter(Boolean);

  // --- Rebuild ---------------------------------------------------------------
  const cwrap = tag('div', 'cwrap');

  if (headingText) cwrap.append(tag('h2', 't-title2', headingText));

  const input = tag('div', 'input');
  input.append(
    iconSpan('spark', buildSpark()),
    tag('span', 'ph t-bodymd', placeholder),
    iconSpan('send', buildSend()),
  );

  const sugg = tag('div', 'sugg');
  pills.forEach((text) => sugg.append(tag('span', 'pill t-bodysm', text)));

  const prompt = tag('div', 'prompt');
  prompt.append(input);
  if (pills.length) prompt.append(sugg);
  cwrap.append(prompt);

  if (discParas.length) {
    const disc = tag('p', 'disc t-bodyxs');
    discParas.forEach((p, i) => {
      if (i > 0) disc.append(document.createElement('br'));
      [...p.childNodes].forEach((n) => disc.append(n.cloneNode(true)));
    });
    // Real-URL anchors keep their href; stamp per-link analytics.
    disc.querySelectorAll('a').forEach((a, i) => {
      a.setAttribute('daa-ll', a.textContent.trim() || `link-${i + 1}`);
    });
    cwrap.append(disc);
  }

  // The section style ('dark') carries the dark-tile treatment.
  el.classList.add('dark');
  el.replaceChildren(cwrap);

  // Run Milo's own text decorator over the rebuilt content so copy gets C2 body
  // classes + analytics wiring (the same primitive C2 text/marquee blocks use).
  if (typeof decorateBlockText === 'function') decorateBlockText(cwrap);

  el.dataset.forgeAuthored = BLOCK;
}
