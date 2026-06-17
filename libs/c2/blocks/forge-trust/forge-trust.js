/**
 * forge-trust — a Milo C2 block authored by Forge for the "Why choose Creative
 * Cloud Pro." trust band (Figma 392:15040): a dark, full-width section with an
 * eyebrow + title head and a 3-up grid of image tiles (cover photo on top,
 * heading + body copy beneath).
 *
 * DA serializes a block's content as a FLAT, class-LESS run of semantic nodes in
 * document order: a leading eyebrow <p>, the <h2> title, then per tile a hero
 * <picture> (with <source>/loading="lazy"), an <h3>, and a body <p>. The authored
 * grid/row/tile wrappers and their classes DO NOT survive into runtime, so this
 * decorator PROBES the flat run by content shape (not by class), slices it into
 * tiles at each media boundary, and REBUILDS the rich layout with createTag —
 * a `.section-inner` holding a `.trust-head` and a `.trust-grid` of `.etile`s,
 * each `.etile` an `.etile-img` cover + `.etile-type` copy — stamping its own
 * `.forge-trust`-scoped classes that the scoped stylesheet keys on.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). Do NOT "correct" this to 2 hops.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-trust';

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

function buildTile(tile) {
  const article = createTag('article', { class: 'etile' });
  article.setAttribute('data-figma-node-id', '392:15045');

  const imgWrap = createTag('div', { class: 'etile-img' });
  imgOf(tile.media)?.setAttribute('daa-im', 'true');
  imgWrap.append(tile.media);
  article.append(imgWrap);

  const type = createTag('div', { class: 'etile-type' });
  if (tile.heading) {
    tile.heading.classList.add('t-h6', 'ink-white');
    type.append(tile.heading);
  }
  tile.body.forEach((p) => {
    p.classList.add('t-body-md', 'ink-subtle');
    type.append(p);
  });
  tile.extra.forEach((n) => type.append(n));
  article.append(type);
  return article;
}

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

  const nodes = [...el.children].filter((n) => n.nodeType === 1);
  // Probe outward for the title (first h1/h2) — never an index.
  const titleEl = nodes.find((n) => n.matches?.('h1, h2'));
  // Eyebrow = the first <p> that appears BEFORE the title.
  let eyebrow = null;
  for (const n of nodes) {
    if (n === titleEl) break;
    if (n.tagName === 'P') { eyebrow = n; break; }
  }

  // Walk the flat run in document order and slice it into tiles at each media
  // boundary (a new tile starts at every <picture>). Account for every node —
  // headings/paragraphs attach to the current tile; ragged leftovers to .extra.
  const tiles = [];
  let cur = null;
  for (const node of nodes) {
    if (node === titleEl || node === eyebrow) continue;
    if (isMedia(node)) {
      cur = { media: node, heading: null, body: [], extra: [] };
      tiles.push(cur);
    } else if (cur) {
      if (node.matches?.('h2, h3, h4, h5, h6') && !cur.heading) cur.heading = node;
      else if (node.tagName === 'P') cur.body.push(node);
      else cur.extra.push(node);
    }
  }

  // Build the head (eyebrow + title).
  const head = createTag('div', { class: 'trust-head' });
  if (eyebrow) {
    eyebrow.classList.add('t-eyebrow', 'ink-subtle');
    head.append(eyebrow);
  }
  if (titleEl) {
    titleEl.classList.add('t-title2', 'ink-white');
    head.append(titleEl);
  }

  // Build the tile grid — N pictures yields N tiles (never an empty grid).
  const grid = createTag('div', { class: 'trust-grid' });
  tiles.forEach((tile) => grid.append(buildTile(tile)));

  const sectionInner = createTag('div', { class: 'section-inner' });
  if (head.childElementCount) sectionInner.append(head);
  sectionInner.append(grid);

  // Single commit — never wipe innerHTML; move-and-replace preserves DOM nodes
  // (and their MEP attributes) the rebuild reuses.
  el.replaceChildren(sectionInner);

  // Run Milo's own text decorator over the head + each copy cluster for
  // analytics + a11y wiring (typography is owned by the scoped CSS). Guarded so
  // a service hiccup never bricks the reconstructed section.
  try {
    const runText = (scope) => (scope || el)
      .querySelectorAll('.trust-head, .etile-type')
      .forEach((cluster) => decorateBlockText?.(cluster));
    if (typeof decorateViewportContent === 'function') decorateViewportContent(el, runText);
    else runText(el);
  } catch (e) {
    window.lana?.log?.(`${BLOCK} decorate: ${e?.message || e}`);
  }

  el.dataset.forgeAuthored = BLOCK;
}
