/**
 * forge-trust — a Milo C2 block authored by Forge from a DISTINCTIVE Figma
 * section ("Why choose Creative Cloud Pro." — a dark, rounded-bottom section
 * with an eyebrow + title header followed by a 3-up row of media tiles, each a
 * bordered/rounded card: image on top, heading + body caption below).
 *
 * DA strips authored classes and serializes the block as a FLAT, class-less run
 * of <p>/<h2>/<picture>/<h3>/<p> in document order — there is NO grid/row/tile
 * wrapper at runtime. So init() PROBES the flat content by shape (never by an
 * authored class or positional index) and RECONSTRUCTS the rich layout with
 * createElement + classList.add, stamping its own .forge-trust-scoped hooks that
 * the co-located forge-trust.css keys on. Nodes (especially <picture>) are
 * MOVED, not cloned, so loading/srcset/sizes survive intact.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). The 3-hop '../../../' form is CORRECT.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-trust';

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

// Build one tile: bordered/rounded media card on top, caption below.
function buildTile(tile) {
  const article = createTag('article', 'trust-tile');

  const imgWrap = createTag('div', 'trust-tile-img');
  const img = tile.media.querySelector('img');
  if (img) img.setAttribute('daa-im', 'true');
  imgWrap.appendChild(tile.media);
  article.appendChild(imgWrap);

  if (tile.texts.length) {
    const cap = createTag('div', 'trust-tile-cap');
    for (const text of tile.texts) {
      if (text.matches('h1, h2, h3, h4, h5, h6')) text.classList.add('trust-heading', 'detail-l');
      else text.classList.add('trust-body', 'body-m');
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
  // of however many EDS row/cell <div>s wrap it.
  const items = [...el.querySelectorAll('h1, h2, h3, h4, h5, h6, p, picture')];
  const titleEl = items.find((n) => n.matches('h1, h2'));
  const titleIdx = titleEl ? items.indexOf(titleEl) : -1;

  // Eyebrow = the first <p> that appears BEFORE the title (header kicker).
  const eyebrowEl = titleIdx > 0
    ? items.slice(0, titleIdx).find((n) => n.matches('p'))
    : null;

  // Tiles = each <picture> anchors a tile; the heading + body that follow it
  // (and before the next picture) belong to that tile.
  const tiles = [];
  let current = null;
  for (const node of items) {
    if (node === titleEl || node === eyebrowEl) continue;
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

  // RECONSTRUCT: section-inner > [head(eyebrow,title), tiles > tile*].
  const inner = createTag('div', 'section-inner');

  if (eyebrowEl || titleEl) {
    const head = createTag('div', 'trust-head');
    if (eyebrowEl) {
      eyebrowEl.classList.add('trust-eyebrow', 'detail-m');
      head.appendChild(eyebrowEl);
    }
    if (titleEl) {
      titleEl.classList.add('trust-title', 'title-2');
      head.appendChild(titleEl);
    }
    inner.appendChild(head);
  }

  if (tiles.length) {
    const row = createTag('div', 'trust-tiles');
    for (const tile of tiles) row.appendChild(buildTile(tile));
    inner.appendChild(row);
  }

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
