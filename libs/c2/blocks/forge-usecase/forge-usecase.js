/**
 * forge-usecase — a Milo C2 block authored by Forge for the "Enhance a photo,
 * then totally transform it." use-case section (Figma 392:15007).
 *
 * DA serializes a block's content as a FLAT, class-LESS run of semantic nodes in
 * document order: an <h2> title, then per tile a badge <picture> (the app
 * mnemonic SVG — or TWO adjacent SVGs for the composite CC badge), the hero
 * <picture> (with <source>/loading="lazy"), an <h3>, and a <p>. The authored
 * grid/row/tile wrappers and their classes DO NOT survive into runtime, so this
 * decorator PROBES the flat run by content shape (not by class), GROUPS each
 * (badge + photo + heading + body) cluster into a `.bento` tile it rebuilds with
 * createTag, and lays the tiles out into `.bento-row`s inside a `.usecase-grid`
 * — stamping its own `.forge-usecase`-scoped classes the scoped stylesheet keys
 * on. The trailing odd tile spans full width (`.bento-wide`) with overlaid copy.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/* is THREE hops up
// (blocks -> c2 -> libs). Do NOT "correct" this to 2 hops.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-usecase';

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

// A hero photo carries responsive <source>s and/or loading="lazy"; a brand-badge
// mnemonic is a bare <picture><img></picture> with neither. Probing by STRUCTURE
// (not by .svg src) keeps the grouping identical in prod and in the data-URI test
// fixture.
function isPhoto(node) {
  const img = imgOf(node);
  if (!img) return false;
  return !!node.querySelector?.('source') || img.getAttribute('loading') === 'lazy';
}
function isBadge(node) {
  return !!imgOf(node) && !isPhoto(node);
}

// Build the badge slot. One SVG => a simple absolute-positioned mnemonic. Two
// adjacent SVGs => the CC composite (tile background + centered mnemonic).
function buildBadge(badges) {
  if (badges.length >= 2) {
    const tile = imgOf(badges[0]);
    const mn = imgOf(badges[1]);
    tile?.classList.add('cc-ico-tile');
    mn?.classList.add('cc-ico-mn');
    tile?.setAttribute('daa-im', 'true');
    const ico = createTag('span', { class: 'cc-ico' });
    if (tile) ico.append(tile);
    if (mn) ico.append(mn);
    return createTag('span', { class: 'bento-badge' }, ico);
  }
  const badge = badges[0];
  badge.classList.add('bento-badge');
  imgOf(badge)?.setAttribute('daa-im', 'true');
  return badge;
}

function buildTile(tile, wide) {
  const article = createTag('article', { class: wide ? 'bento bento-wide' : 'bento' });
  article.setAttribute('data-figma-node-id', '392:15012');
  if (tile.badges.length) article.append(buildBadge(tile.badges));

  if (tile.photos.length) {
    const media = createTag('div', { class: 'bento-img' });
    tile.photos.forEach((p) => {
      imgOf(p)?.setAttribute('daa-im', 'true');
      media.append(p);
    });
    article.append(media);
  }

  const copy = createTag('div', { class: 'bento-copy' });
  if (tile.heading) {
    tile.heading.classList.add('t-h6', wide ? 'ink-white' : 'ink-dark');
    copy.append(tile.heading);
  }
  tile.body.forEach((p) => {
    p.classList.add('t-body-md', wide ? 'ink-white' : 'ink-dark-subtle');
    copy.append(p);
  });
  tile.extra.forEach((n) => copy.append(n));
  article.append(createTag('div', { class: wide ? 'bento-overlay' : 'bento-type' }, copy));
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

  // Walk the flat run in document order and slice it into tiles at each badge
  // boundary (a new tile starts at a badge that does NOT follow another badge,
  // so the CC composite's two adjacent SVGs stay in one tile). Account for every
  // node — ragged leftovers attach to the current tile's copy.
  const tiles = [];
  let cur = null;
  let prevBadge = false;
  const newTile = () => {
    cur = { badges: [], photos: [], heading: null, body: [], extra: [] };
    tiles.push(cur);
    return cur;
  };
  for (const node of nodes) {
    if (node === titleEl) { prevBadge = false; continue; }
    const badge = isBadge(node);
    if (badge) {
      if (!prevBadge || !cur) newTile();
      cur.badges.push(node);
    } else {
      if (!cur) newTile();
      if (isPhoto(node)) cur.photos.push(node);
      else if (node.matches?.('h3, h4, h5, h6') && !cur.heading) cur.heading = node;
      else if (node.tagName === 'P') cur.body.push(node);
      else cur.extra.push(node);
    }
    prevBadge = badge;
  }

  // The trailing tile of an odd run spans full width (the wide hero idiom).
  const wideIdx = tiles.length % 2 === 1 ? tiles.length - 1 : -1;

  const grid = createTag('div', { class: 'usecase-grid' });
  let row = null;
  tiles.forEach((tile, i) => {
    const wide = i === wideIdx;
    const tileEl = buildTile(tile, wide);
    if (wide) {
      grid.append(createTag('div', { class: 'bento-row' }, tileEl));
      row = null;
    } else {
      if (!row) { row = createTag('div', { class: 'bento-row' }); grid.append(row); }
      row.append(tileEl);
      if (row.children.length === 2) row = null;
    }
  });

  const innerWrap = createTag('div', { class: 'usecase-inner' });
  if (titleEl) {
    titleEl.classList.add('usecase-title', 't-title3', 'ink-white');
    innerWrap.append(titleEl);
  }
  innerWrap.append(grid);

  // Single commit — never wipe innerHTML; move-and-replace preserves DOM nodes
  // (and their MEP/personalization attributes) the rebuild reuses.
  el.replaceChildren(innerWrap);

  // Run Milo's own text decorator over each copy cluster for analytics + a11y
  // wiring (typography is owned by the scoped CSS). Guarded so a service hiccup
  // never bricks the reconstructed section.
  try {
    const runText = (scope) => (scope || el)
      .querySelectorAll('.bento-copy')
      .forEach((copy) => decorateBlockText?.(copy));
    if (typeof decorateViewportContent === 'function') decorateViewportContent(el, runText);
    else runText(el);
  } catch (e) {
    window.lana?.log?.(`${BLOCK} decorate: ${e?.message || e}`);
  }

  el.dataset.forgeAuthored = BLOCK;
}
