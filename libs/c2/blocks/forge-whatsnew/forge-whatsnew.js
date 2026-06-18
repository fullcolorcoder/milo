/**
 * forge-whatsnew — Milo C2 block: "There's always something new with Acrobat."
 *
 * DISTINCTIVE SECTION. At runtime DA hands `init(el)` a FLAT, class-LESS run of
 * semantic nodes in document order (eyebrow <p>, title <h2>, then repeating
 * <picture> + <h3> + <p> + <a> clusters) — NO grid, NO row wrappers, NO Figma
 * classes (DA strips them). This decorator PROBES that flat run by content shape
 * and RECONSTRUCTS the rich 3-up card grid with createElement + classList.add,
 * stamping its own `.forge-whatsnew`-scoped class names that the co-located CSS
 * keys on. Each <picture> is the BOUNDARY that starts a new card; everything
 * before the first <picture> is the head. Every flat child is accounted for so a
 * ragged trailing node is never dropped.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: libs/c2/blocks/<name>/ -> libs/utils/decorate.js is THREE
// hops up (blocks -> c2 -> libs). Keep the 3-hop specifier.
import { decorateBlockText } from '../../../utils/decorate.js';

const BLOCK = 'forge-whatsnew';

// MEP / personalization markers Milo stamps on the row/cell wrapper. The un-wrap
// discards that wrapper, so copy any present marker onto the block root first.
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

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

// A node is "media" when its only meaningful content is a picture/img (it carries
// no heading/paragraph/link text). This is the card boundary marker.
function isMedia(node) {
  if (!node || node.nodeType !== 1) return false;
  if (node.matches('picture, img')) return true;
  return !!node.querySelector?.('picture, img')
    && !node.querySelector?.('h1, h2, h3, h4, h5, h6, p, a, button');
}

// The <picture> (or bare <img>) carried by a media node.
function pictureFrom(node) {
  if (node.matches('picture, img')) return node;
  return node.querySelector('picture') || node.querySelector('img') || node;
}

function buildLearnLink(anchor) {
  anchor.classList.add('wn-learn');
  anchor.setAttribute('daa-ll', 'Learn more');
  const label = anchor.textContent.trim() || 'Learn more';
  anchor.textContent = '';
  const span = el('span', 'wn-learn-label');
  span.textContent = label;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'wn-arrow');
  svg.setAttribute('viewBox', '0 0 6 10');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M1 1l4 4-4 4');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.4');
  svg.appendChild(path);
  anchor.append(span, svg);
  return anchor;
}

function buildCard(media, copyNodes) {
  const card = el('article', 'wn-card');
  const figure = el('div', 'wn-img');
  const pic = pictureFrom(media);
  figure.appendChild(pic);
  pic.querySelectorAll('img').forEach((img) => img.setAttribute('daa-im', 'true'));
  card.appendChild(figure);

  const copy = el('div', 'wn-copy');
  for (const node of copyNodes) {
    if (node.matches('h1, h2, h3, h4, h5, h6')) node.classList.add('wn-title');
    else if (node.matches('a')) buildLearnLink(node);
    else if (node.matches('p')) node.classList.add('wn-body');
    copy.appendChild(node);
  }
  card.appendChild(copy);
  return card;
}

export default async function init(el2) {
  if (!el2) return;
  el2.setAttribute('daa-lh', BLOCK);

  // Un-wrap the single content cell so we work on the flat run of authored nodes.
  const inner = el2.querySelector(':scope > div > div') || el2.querySelector(':scope > div');
  let source = el2;
  if (inner) {
    preserveMepAttrs(inner.parentElement || inner, el2);
    source = inner;
  }
  const nodes = [...source.children].filter((n) => n.nodeType === 1);
  if (!nodes.length) { el2.dataset.forgeAuthored = BLOCK; return; }

  // Head = leading nodes before the first media boundary.
  const head = el('div', 'head');
  let i = 0;
  for (; i < nodes.length && !isMedia(nodes[i]); i += 1) {
    const n = nodes[i];
    if (n.matches('p') && !head.querySelector('.eyebrow')) n.classList.add('eyebrow');
    else if (n.matches('h1, h2, h3, h4, h5, h6')) n.classList.add('title');
    else n.classList.add('eyebrow');
    head.appendChild(n);
  }

  // Cards: each media node opens a new card; following non-media nodes belong to it.
  const grid = el('div', 'whatsnew-grid');
  let media = null;
  let copyNodes = [];
  const flush = () => { if (media) grid.appendChild(buildCard(media, copyNodes)); };
  for (; i < nodes.length; i += 1) {
    const n = nodes[i];
    if (isMedia(n)) {
      flush();
      media = n;
      copyNodes = [];
    } else if (media) {
      copyNodes.push(n);
    } else {
      // Ragged leading copy with no media yet — keep it in the head, never drop.
      head.appendChild(n);
    }
  }
  flush();

  // Rebuild the section once (no innerHTML wipe — preserves authored nodes/MEP).
  const rebuilt = [];
  if (head.children.length) rebuilt.push(head);
  if (grid.children.length) rebuilt.push(grid);
  el2.replaceChildren(...rebuilt);

  // Promote head typography via Milo's own text decorator (same primitive C2
  // text/marquee blocks use). Additive to the .title/.eyebrow classes the CSS
  // keys on; guarded so a config-less call can never brick the section.
  try { if (typeof decorateBlockText === 'function') decorateBlockText(head); } catch (e) { /* non-fatal */ }

  el2.dataset.forgeAuthored = BLOCK;
}
