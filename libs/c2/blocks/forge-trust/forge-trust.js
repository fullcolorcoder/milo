/**
 * forge-trust — a Milo C2 block authored by Forge from a DISTINCTIVE Figma
 * section ("Why choose Creative Cloud Pro." — a dark, rounded-bottom section
 * with an eyebrow + title header followed by a 3-up row of media tiles, each a
 * bordered/rounded card: image on top, heading + body caption below).
 *
 * DA strips authored classes and serializes the block as a FLAT, class-less run
 * of text/p/h2/img/h3/p in document order — there is NO grid/row/tile
 * wrapper at runtime. So init() PROBES the flat content by shape (never by an
 * authored class or positional index) and RECONSTRUCTS the rich layout with
 * createElement + classList.add, stamping its own .forge-trust-scoped hooks that
 * the co-located forge-trust.css keys on. Nodes (especially <img>/<picture>) are
 * MOVED, not cloned, so loading/srcset/sizes survive intact.
 *
 * DA serializes images as bare <img> elements (not <picture>), and short label
 * text as bare text nodes (not <p>). Both cases are handled before probing.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). The 3-hop '../../../' form is CORRECT.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-trust';

// Returns true when a node is (or directly wraps) a tile media element.
// DA serialises images as bare <img>; EDS wraps them in <picture>; both are
// treated as media anchors. A <p> wrapping only an <img>/<picture> is also a
// media anchor (EDS sometimes adds the wrapper).
function isTileMedia(node) {
  if (node.matches('picture, img')) return true;
  if (node.matches('p')) {
    const media = node.querySelector('picture, img');
    return !!(media && node.children.length === 1 && node.children[0] === media);
  }
  return false;
}

// Extract the media element from a bare <img>, bare <picture>, or <p> wrapper.
function getTileMedia(node) {
  if (node.matches('picture, img')) return node;
  return node.querySelector('picture, img') || node;
}

// DA sometimes serialises short label text (like the eyebrow) as a bare text
// node instead of a <p> element. Normalise these into <p> wrappers BEFORE the
// shape-based probe runs so eyebrow detection works uniformly.
function normalizeTextNodes(root) {
  // Content lives inside the innermost EDS wrapper: el > div > div
  const inner = root.querySelector(':scope > div > div')
    || root.querySelector(':scope > div')
    || root;
  for (const node of [...inner.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = node.textContent.trim();
      inner.insertBefore(p, node);
      inner.removeChild(node);
    }
  }
}

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
  // For bare <img>: the media itself is the img element.
  // For <picture>: querySelector('img') locates the inner <img>.
  const img = tile.media.tagName === 'IMG' ? tile.media : tile.media.querySelector('img');
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

  // Step 1: normalise bare text nodes → <p> so eyebrow detection works.
  normalizeTextNodes(el);

  // Step 2: Probe by content shape across the whole block in DOCUMENT ORDER.
  // Exclude <img> elements that live INSIDE a <picture> (handled by the <picture>)
  // and bare <img> elements that live INSIDE a <p> (handled by the <p> wrapper)
  // to avoid double-counting when EDS wraps images in paragraph nodes.
  const items = [...el.querySelectorAll('h1, h2, h3, h4, h5, h6, p, picture, img')]
    .filter((n) => {
      if (n.matches('img') && n.closest('picture')) return false;
      if (n.matches('img') && n.closest('p')) return false;
      return true;
    });

  const titleEl = items.find((n) => n.matches('h1, h2'));
  const titleIdx = titleEl ? items.indexOf(titleEl) : -1;

  // Eyebrow = the first plain <p> (not a picture/img wrapper) before the title.
  const eyebrowEl = titleIdx > 0
    ? items.slice(0, titleIdx).find((n) => n.matches('p') && !isTileMedia(n))
    : null;

  // Tiles = each <img>/<picture> (or <p> wrapping one) anchors a tile; the
  // heading and body text that follow (before the next media anchor) belong to
  // that tile.
  const tiles = [];
  let current = null;
  for (const node of items) {
    if (node === titleEl || node === eyebrowEl) continue;
    if (isTileMedia(node)) {
      current = { media: getTileMedia(node), texts: [] };
      tiles.push(current);
    } else if (current) {
      // Skip empty <p> wrappers left behind after media extraction.
      if (node.matches('p') && node.childElementCount === 1 && node.querySelector('picture, img')) continue;
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
