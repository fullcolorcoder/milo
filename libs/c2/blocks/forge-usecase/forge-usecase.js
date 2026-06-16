/**
 * forge-usecase — a light, full-width "use case" bento section: a section title
 * over a 2-up grid of bento tiles. Each tile is an app-mnemonic badge pinned
 * top-left, a covering media area, and a copy block (heading + body) anchored to
 * the bottom of the tile.
 *
 * CRITICAL (DA serialization, C24): at runtime DA strips the authored structural
 * classes (.usecase / .uc-grid / .uc-row / .bento / .imgarea / .type / .badge …)
 * and hands `init(el)` a FLAT, class-less run of <h2>/<p>(badge)/<picture>/
 * <p>(heading)/<p>(body)… in document order — no grid, no rows, no tiles. So this
 * decorator NEVER reads authored classes; it PROBES BY CONTENT ORDER (C2), groups
 * each (badge? + media + heading + body) cluster into a `.bento` tile it builds
 * with createElement, packs the tiles two-up into `.row-2` rows inside
 * `.usecase__grid`, and commits once via el.replaceChildren(). The scoped CSS keys
 * only on the classes this file stamps, so it renders identically in production
 * and in the test fixture.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: libs/c2/blocks/<name>/ -> libs/utils/ is THREE hops up
// (blocks -> c2 -> libs). Do NOT "correct" to 2 hops.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-usecase';

// App-mnemonic glyphs that get a brand-color tile (C22). Lowercased text → modifier.
const GLYPHS = new Set(['fi', 'fr', 'ai', 'id', 'ex', 'pr', 'ae', 'ps', 'lr']);
const TILES_PER_ROW = 2;

// MEP / personalization markers Milo stamps on the row/cell wrapper we discard
// during the rebuild — copy them onto the block root FIRST so Target/MEP still
// finds them after replaceChildren() (C11).
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

function createTag(tag, attrs = {}, content) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => { if (v != null) node.setAttribute(k, v); });
  if (content != null) {
    if (typeof content === 'string') node.textContent = content;
    else if (Array.isArray(content)) content.forEach((c) => c && node.append(c));
    else node.append(content);
  }
  return node;
}

const isGlyphText = (txt) => txt && txt.length <= 3 && /^[A-Za-z]{1,3}$/.test(txt);

// Build the app-mnemonic badge. An image badge (the Firefly sparkle) keeps its
// gradient tile; a text glyph maps to a brand-color modifier (C22) — but only
// when no --modifier is already present.
function buildBadge(badge) {
  if (!badge) return null;
  const appicon = createTag('span', { class: 'appicon', 'aria-hidden': 'true' });
  if (/appicon--/.test(appicon.className)) return appicon;
  if (badge.img) {
    appicon.classList.add('appicon--firefly');
    badge.img.setAttribute('daa-im', 'true');
    if (!badge.img.getAttribute('width')) badge.img.setAttribute('width', '32');
    if (!badge.img.getAttribute('height')) badge.img.setAttribute('height', '32');
    appicon.append(badge.img);
  } else if (badge.text) {
    const glyph = badge.text.trim();
    const key = glyph.toLowerCase();
    if (GLYPHS.has(key)) appicon.classList.add(`appicon--${key}`);
    appicon.textContent = glyph;
  }
  return appicon;
}

// Assemble one bento tile from a probed cluster.
function buildTile(tile) {
  const bento = createTag('article', { class: 'bento' });
  const badge = buildBadge(tile.badge);
  if (badge) bento.append(badge);

  if (tile.pic) {
    const img = tile.pic.querySelector('img');
    if (img) img.setAttribute('daa-im', 'true');
    bento.append(createTag('div', { class: 'bento__img' }, tile.pic));
  }

  const wrap = createTag('div', { class: 'bento__copy-wrap' });
  if (tile.heading) wrap.append(createTag('h3', { class: 'bento__h title-2' }, tile.heading));
  if (tile.body) wrap.append(createTag('p', { class: 'bento__b body-md' }, tile.body));
  bento.append(createTag('div', { class: 'bento__copy' }, wrap));
  return bento;
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // The single rich content cell DA serializes into (block > div > div). Lift its
  // MEP markers up before we discard it in the rebuild.
  const cell = el.querySelector(':scope > div > div')
    || el.querySelector(':scope > div')
    || el;
  preserveMepAttrs(cell?.parentElement || cell, el);

  // --- Probe by content ORDER (NOT by class) ----------------------------
  const nodes = [...(cell?.children || [])];
  let title = null;
  const tiles = [];
  let current = null;
  let pendingBadge = null;

  for (const node of nodes) {
    if (node.nodeType !== 1) continue;
    const pic = node.matches('picture') ? node : node.querySelector('picture');
    const txt = node.textContent.trim();
    const bareImg = pic ? null
      : (node.matches('img') ? node : [...node.querySelectorAll('img')].find((i) => !i.closest('picture')));

    // Media starts a new tile, consuming any pending badge.
    if (pic) {
      current = { badge: pendingBadge, pic, heading: null, body: null };
      tiles.push(current);
      pendingBadge = null;
      continue;
    }
    // A bare image with no real text is the next tile's mnemonic badge.
    if (bareImg && (!txt || txt.length <= 2)) { pendingBadge = { img: bareImg }; continue; }
    // A short alpha string (Pr/Ae/Fi…) is the next tile's mnemonic badge.
    if (isGlyphText(txt)) { pendingBadge = { text: txt }; continue; }
    // First substantial text before any tile is the section title.
    if (!current) { if (txt && !title) title = txt; continue; }
    // Inside a tile: first long text is the heading, the rest is the body.
    if (!txt) continue;
    if (!current.heading) current.heading = txt;
    else current.body = current.body ? `${current.body} ${txt}` : txt;
  }

  // --- Rebuild the visual structure -------------------------------------
  const grid = createTag('div', { class: 'usecase__grid' });
  for (let i = 0; i < tiles.length; i += TILES_PER_ROW) {
    const row = createTag('div', { class: 'row-2' });
    tiles.slice(i, i + TILES_PER_ROW).forEach((t) => row.append(buildTile(t)));
    grid.append(row);
  }

  const inner = createTag('div', { class: 'usecase__inner' });
  // At most one h1 per block (C8) — the section title is an h2.
  if (title) inner.append(createTag('h2', { class: 'usecase__title title-2' }, title));
  inner.append(grid);
  el.replaceChildren(inner);

  // Milo typography/analytics wiring, per-viewport-safe. Scoped to each tile's
  // copy cluster so headings/body decorate without disturbing the grid scaffold.
  // Guarded so a decorate-service hiccup can't brick the already-rebuilt section.
  const decorate = (scope) => {
    if (typeof decorateBlockText !== 'function') return;
    scope.querySelectorAll?.('.bento__copy').forEach((c) => decorateBlockText(c));
  };
  try {
    if (typeof decorateViewportContent === 'function') decorateViewportContent(el, decorate);
    else decorate(el);
  } catch (e) {
    window.lana?.log?.(`${BLOCK} decorate failed: ${e.message}`, { tags: BLOCK });
  }

  el.dataset.forgeAuthored = BLOCK;
}
