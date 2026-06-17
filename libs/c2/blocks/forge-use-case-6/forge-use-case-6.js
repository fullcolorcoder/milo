/**
 * forge-use-case-6 — a Milo C2 block authored by Forge from a DISTINCTIVE Figma
 * section ("Take your designs further, faster." — a dark bento layout: a 2-up
 * row of media+heading+body tiles, a full-width media tile, then another 2-up
 * row).
 *
 * DA strips authored classes and serializes the block as a FLAT, class-less run
 * of <h2>/<picture>/<h3>/<p> in document order — there is NO grid/row/tile
 * wrapper at runtime. So init() PROBES the flat content by shape (never by an
 * authored class or positional index) and RECONSTRUCTS the rich bento layout
 * with createElement + classList.add, stamping its own .forge-use-case-6-scoped
 * hooks that the co-located forge-use-case-6.css keys on. Nodes (especially
 * <picture>) are MOVED, not cloned, so loading/srcset/sizes survive intact.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). The 3-hop '../../../' form is CORRECT.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-use-case-6';

// MEP / personalization markers Milo stamps on the row/cell wrapper. We rebuild
// the section, so copy any present marker up onto the block root FIRST
// (data-manifest-id, data-adobe-target-testid, and every data-mep-* attr) — a
// node swap that drops them silently disables Target/MEP on the section.
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

// A tile is "full width" when its media is a wide landscape asset. DA keeps the
// authored srcset/src width params, so the wide hero declares ~1192/2000px while
// the 2-up tiles cap at ~750/1200px — a content-shape signal, not a class.
function isFullTile(tile) {
  let max = 0;
  const collect = (s) => {
    if (!s) return;
    for (const m of s.matchAll(/width=(\d+)/g)) max = Math.max(max, parseInt(m[1], 10));
  };
  const img = tile.media.querySelector('img');
  if (img) collect(img.getAttribute('src') || img.getAttribute('srcset'));
  for (const source of tile.media.querySelectorAll('source')) collect(source.getAttribute('srcset'));
  return max >= 1500;
}

// Build a single bento tile: media on top, caption (heading + body) below.
// `hiddenCap` makes the caption screen-reader-only (for the full-width media
// tile where the copy is carried visually by the image).
function buildTile(tile, { full = false, hiddenCap = false } = {}) {
  const article = createTag('article', full ? 'bento bento-full' : 'bento');

  const imgWrap = createTag('div', 'bento-img');
  const img = tile.media.querySelector('img');
  if (img) img.setAttribute('daa-im', 'true');
  imgWrap.appendChild(tile.media);
  article.appendChild(imgWrap);

  if (tile.texts.length) {
    const cap = createTag('div', hiddenCap ? 'bento-cap bento-cap-vh' : 'bento-cap');
    for (const text of tile.texts) {
      if (text.matches('h1, h2, h3, h4, h5, h6')) text.classList.add('bento-heading', 'detail-l');
      else text.classList.add('bento-body', 'body-m');
      cap.appendChild(text);
    }
    article.appendChild(cap);
  }
  return article;
}

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo; daa-ll stays section-owned).
  el.setAttribute('daa-lh', BLOCK);

  // Probe by content shape across the whole block in DOCUMENT ORDER, regardless
  // of however many EDS row/cell <div>s wrap it. <picture> is the tile anchor;
  // the heading + body that follow it belong to that tile.
  const items = [...el.querySelectorAll('h1, h2, h3, h4, h5, h6, p, picture')];
  const titleEl = items.find((n) => n.matches('h1, h2'));

  const tiles = [];
  let current = null;
  for (const node of items) {
    if (node === titleEl) continue;
    if (node.matches('picture')) {
      current = { media: node, texts: [] };
      tiles.push(current);
    } else if (current) {
      current.texts.push(node);
    }
  }

  // Nothing recognizable to rebuild — leave the authored DOM untouched.
  if (!titleEl && tiles.length === 0) {
    el.dataset.forgeAuthored = BLOCK;
    return;
  }

  // RECONSTRUCT the rich layout: section-inner > [title, uc-grid > uc-row*].
  const inner = createTag('div', 'section-inner');

  if (titleEl) {
    titleEl.classList.add('uc-title', 'title-2');
    inner.appendChild(titleEl);
  }

  const grid = createTag('div', 'uc-grid');
  // Group standard tiles into 2-up rows; a wide tile breaks out onto its own
  // full-width row (its caption is carried screen-reader-only — the image
  // speaks visually). This reproduces the [2-up, full, 2-up] bento rhythm from
  // the FLAT content WITHOUT relying on positional index.
  const buffer = [];
  const flushBuffer = () => {
    while (buffer.length) {
      const slice = buffer.splice(0, 2);
      const row = createTag('div', 'uc-row');
      for (const tile of slice) row.appendChild(buildTile(tile));
      grid.appendChild(row);
    }
  };
  for (const tile of tiles) {
    if (isFullTile(tile)) {
      flushBuffer();
      const row = createTag('div', 'uc-row uc-row-full');
      row.appendChild(buildTile(tile, { full: true, hiddenCap: true }));
      grid.appendChild(row);
    } else {
      buffer.push(tile);
    }
  }
  flushBuffer();
  inner.appendChild(grid);

  // Preserve MEP markers from the cell wrapper onto the root before we swap.
  const wrapper = el.querySelector(':scope > div > div') || el.querySelector(':scope > div');
  preserveMepAttrs(wrapper, el);

  // Single swap — no innerHTML wipe; authored nodes are MOVED into the new tree.
  el.replaceChildren(inner);

  // Run Milo's own text decorator to wire analytics + a11y onto the rebuilt copy.
  // Guarded so a thrown internal never bricks decorate; the scoped CSS does not
  // depend on its output.
  const decorate = (scope) => {
    try { decorateBlockText(scope); } catch (e) { /* non-fatal */ }
  };
  try {
    if (typeof decorateViewportContent === 'function') decorateViewportContent(el, decorate);
    else decorate(el);
  } catch (e) { /* non-fatal */ }

  el.dataset.forgeAuthored = BLOCK;
}
