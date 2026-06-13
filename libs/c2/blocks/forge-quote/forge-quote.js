/**
 * forge-quote — a Milo C2 testimonial/pull-quote section.
 *
 * Renders a centered bordered box (with four crosshair corner marks) holding a
 * large blockquote and a name/role attribution, flanked by two ruled side
 * panels. The scoped stylesheet `forge-quote.css` keys on the authored class
 * names (`.side`, `.box`, `.mark`, `.attr`, `.name`, `.role`, `.t-title1`,
 * `.t-bodymd`), so this decorator reads the DA-authored content (quote + name +
 * role) and rebuilds that exact structure via createElement, then swaps it in
 * once with replaceChildren (never an innerHTML wipe — that would drop
 * Target/MEP/authored DOM).
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). The 3-hop '../../../' form is CORRECT.
import { decorateBlockText } from '../../../utils/decorate.js';

const BLOCK = 'forge-quote';

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

function buildMarks() {
  return ['m-tl', 'm-tr', 'm-bl', 'm-br'].map((pos) => tag('span', `mark ${pos}`));
}

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Probe outward for the authored content — never positional el.children[N],
  // authors rearrange rows.
  const rows = [...el.querySelectorAll(':scope > div')];
  preserveMepAttrs(rows[0]?.firstElementChild || rows[0], el);

  // Quote text: an authored <blockquote> wins; else the first paragraph/heading.
  const quoteSource = el.querySelector('blockquote')
    || rows[0]?.querySelector('p, h2, h3, h4, h5, h6')
    || rows[0];
  const quoteText = quoteSource ? quoteSource.textContent.trim() : '';

  // Attribution lives in a distinct row from the quote; first <p> is the name,
  // second is the role. Tolerate a missing attribution row.
  const attrRow = rows.length > 1 ? rows[rows.length - 1] : null;
  const attrParas = attrRow && attrRow !== rows[0]
    ? [...attrRow.querySelectorAll('p, span')].filter((p) => p.textContent.trim())
    : [];
  const name = attrParas[0]?.textContent.trim() || '';
  const role = attrParas[1]?.textContent.trim() || '';

  // Rebuild the testimonial structure.
  const box = tag('div', 'box');
  box.append(...buildMarks());

  const quote = tag('blockquote', 't-title1', quoteText);
  box.append(quote);

  if (name || role) {
    const attr = tag('div', 'attr');
    if (name) attr.append(tag('p', 'name t-bodymd', name));
    if (role) attr.append(tag('p', 'role t-bodymd', role));
    box.append(attr);
  }

  // The section style ('dark') carries the dark-tile treatment.
  el.classList.add('dark');
  el.replaceChildren(tag('div', 'side'), box, tag('div', 'side'));

  // Run Milo's own text decorator over the rebuilt box so copy gets C2 body
  // classes + analytics wiring (the same primitive C2 text/marquee blocks use).
  if (typeof decorateBlockText === 'function') decorateBlockText(box);

  el.dataset.forgeAuthored = BLOCK;
}
