/**
 * forge-bentos — a Milo C2 block for the "See what's in Creative Cloud Pro."
 * bento section: a dark, rounded-bottom band with a centred title and a grid of
 * light bento tiles (image on top, heading + body copy beneath).
 *
 * DA serialises a block's content as a FLAT, class-less run of semantic nodes in
 * document order — here: <h2> (title), then repeating <picture> / <h3> / <p>
 * clusters (one per tile). The authored Figma structure (.bento-grid / .bento-row
 * / .bento) does NOT survive authoring, so this decorator RECONSTRUCTS it:
 *   - probes by content shape (the first heading is the title; every <picture>
 *     starts a new tile; following non-picture nodes belong to that tile),
 *   - groups tiles into rows of two,
 *   - stamps its OWN .forge-bentos-scoped classes (.bentos-title / .bento-grid /
 *     .bento-row / .bento / .bento-img / .bento-type / .bento-copy) that the
 *     scoped CSS keys on,
 *   - never wipes innerHTML — it moves the authored nodes into the rebuilt tree
 *     and commits once with replaceChildren so MEP / Target / authored attrs are
 *     preserved.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). Do NOT 'correct' it to 2 hops.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-bentos';

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

function createTag(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

const isHeading = (n) => n && n.nodeType === 1 && /^H[1-6]$/.test(n.tagName);
const isMedia = (n) => n && n.nodeType === 1
  && (n.tagName === 'PICTURE' || (n.tagName === 'IMG'));

// Build one .bento tile from a {media, copy[]} group. Reuses the authored nodes
// (moves them in) so picture/source/img attributes, MEP markers, alt text, and
// loading="lazy" are all preserved.
function buildBento(group) {
  const bento = createTag('article', 'bento');

  if (group.media) {
    const imgWrap = createTag('div', 'bento-img');
    imgWrap.append(group.media);
    const img = group.media.matches?.('img') ? group.media : group.media.querySelector?.('img');
    if (img) img.setAttribute('daa-im', 'true');
    bento.append(imgWrap);
  }

  const type = createTag('div', 'bento-type');
  const copy = createTag('div', 'bento-copy');
  for (const node of group.copy) {
    if (isHeading(node)) {
      node.classList.add('t-h6', 'ink-dark');
    } else if (node.tagName === 'P') {
      node.classList.add('t-body-md', 'ink-dark-subtle');
    }
    copy.append(node);
  }
  type.append(copy);
  bento.append(type);
  return bento;
}

export default async function init(el) {
  if (!el) return;
  if (el.dataset.forgeAuthored === BLOCK) return;
  el.setAttribute('daa-lh', BLOCK);

  // Un-wrap the single content cell so we operate on the flat authored run.
  const inner = el.querySelector(':scope > div > div');
  if (inner) {
    preserveMepAttrs(inner.parentElement, el);
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  // Walk the flat children IN DOCUMENT ORDER. Everything before the first media
  // node is preamble (the title); every <picture> opens a new tile and the
  // following non-media nodes (heading + copy) attach to it. This accounts for
  // EVERY child — nothing is dropped, group count === picture count.
  const nodes = [...el.children].filter((n) => n.nodeType === 1);
  const preamble = [];
  const groups = [];
  let current = null;
  for (const node of nodes) {
    if (isMedia(node)) {
      current = { media: node, copy: [] };
      groups.push(current);
    } else if (current) {
      current.copy.push(node);
    } else {
      preamble.push(node);
    }
  }

  // Title: first heading in the preamble (fall back to first preamble node).
  const titleEl = preamble.find(isHeading) || preamble[0] || null;
  if (titleEl) titleEl.classList.add('t-title2', 'ink-white', 'bentos-title');

  // Build the grid: rows of two tiles. A ragged trailing tile takes the row
  // alone. If somehow there are no media groups, fall back to all content in one
  // tile so the section is never an empty container.
  const grid = createTag('div', 'bento-grid');
  if (groups.length) {
    for (let i = 0; i < groups.length; i += 2) {
      const row = createTag('div', 'bento-row');
      for (const group of groups.slice(i, i + 2)) row.append(buildBento(group));
      grid.append(row);
    }
  } else if (preamble.length > 1) {
    const row = createTag('div', 'bento-row');
    row.append(buildBento({ media: null, copy: preamble.filter((n) => n !== titleEl) }));
    grid.append(row);
  }

  // Commit once. Keep any non-title preamble that is not the grid (rare) by
  // appending it ahead of the grid so no authored node is discarded.
  const leftover = preamble.filter((n) => n !== titleEl && groups.length);
  const commit = [];
  if (titleEl) commit.push(titleEl);
  commit.push(...leftover);
  commit.push(grid);
  el.replaceChildren(...commit);

  // Run Milo's text decorator for analytics + a11y wiring (additive; our own
  // typography classes still drive the visual target). Guarded so it can never
  // break decorate on a structure it does not expect.
  const enrich = (scope) => {
    try {
      (scope || el).querySelectorAll('.bento-copy').forEach((c) => decorateBlockText(c));
    } catch (e) { /* non-fatal: analytics enrichment only */ }
  };
  if (typeof decorateViewportContent === 'function') {
    try { decorateViewportContent(el, enrich); } catch (e) { enrich(el); }
  } else {
    enrich(el);
  }

  el.dataset.forgeAuthored = BLOCK;
}
