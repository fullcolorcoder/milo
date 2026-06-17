/**
 * forge-usecase-5 — Milo C2 "use case" bento grid.
 *
 * DA serializes this block's content as a FLAT, class-less run of semantic nodes
 * in document order (a section <h2>, then per tile: optional badge <picture>(s),
 * one media <picture>, an <h3> and a <p>). DA STRIPS the authored Figma classes
 * (`.usecase-grid`, `.bento-row`, `.bento`, …), so init(el) must PROBE by content
 * shape — never by an authored class — and RECONSTRUCT the rich bento grid:
 *   section-inner
 *     h2.usecase-title
 *     .usecase-grid
 *       .bento-row  ->  article.bento ( .bento-badge? + .bento-img + .bento-type>.bento-copy )
 *
 * Grouping signal (robust in prod AND in the network-free test fixture): a MEDIA
 * picture carries <source> children; a BADGE picture (Firefly svg, CC tile/mnemonic
 * svg) does not. Each media picture starts a new tile; preceding badge pictures
 * attach to that tile; the following <h3>/<p> are its copy.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/ is THREE hops up
// (blocks -> c2 -> libs). Do NOT 'correct' to 2 hops.
import { decorateBlockText } from '../../../utils/decorate.js';

const BLOCK = 'forge-usecase-5';
const TILES_PER_ROW = 2;

// MEP / personalization markers Milo stamps on the row/cell wrapper. The rebuild
// discards those wrappers, so copy any present marker onto el FIRST.
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

function tag(name, className) {
  const node = document.createElement(name);
  if (className) node.className = className;
  return node;
}

// A media picture has <source> children; a small badge/mnemonic picture does not.
function isMediaPicture(pic) {
  return !!pic.querySelector('source');
}

// Build the badge slot from 1..n badge pictures. One picture => a plain app icon;
// two => a CC tile + mnemonic composite stacked inside .cc-ico.
function buildBadge(badges) {
  const slot = tag('span', 'bento-badge');
  if (badges.length === 1) {
    slot.appendChild(badges[0]);
    return slot;
  }
  const ico = tag('span', 'cc-ico');
  badges[0].querySelector('img')?.classList.add('cc-ico-tile');
  badges[1].querySelector('img')?.classList.add('cc-ico-mn');
  ico.appendChild(badges[0]);
  ico.appendChild(badges[1]);
  // any extra badges (defensive) ride along so no node is discarded
  badges.slice(2).forEach((b) => ico.appendChild(b));
  slot.appendChild(ico);
  return slot;
}

function buildTile(tile) {
  const article = tag('article', 'bento');

  if (tile.badges.length) article.appendChild(buildBadge(tile.badges));

  if (tile.media) {
    const imgWrap = tag('div', 'bento-img');
    imgWrap.appendChild(tile.media);
    const img = tile.media.querySelector('img');
    if (img) img.setAttribute('daa-im', 'true');
    article.appendChild(imgWrap);
  }

  const type = tag('div', 'bento-type');
  const copy = tag('div', 'bento-copy');
  if (tile.heading) {
    tile.heading.classList.add('t-h6', 'ink-dark');
    copy.appendChild(tile.heading);
  }
  tile.bodies.forEach((p) => {
    p.classList.add('t-body-md', 'ink-dark-subtle');
    copy.appendChild(p);
  });
  type.appendChild(copy);
  article.appendChild(type);

  // Milo's own text decorator wires a11y/analytics on the copy cluster. Guarded:
  // never let an optional service break the rebuild.
  try {
    if (typeof decorateBlockText === 'function' && (tile.heading || tile.bodies.length)) {
      decorateBlockText(copy);
    }
  } catch (e) { /* non-fatal */ }

  return article;
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // Lift MEP markers off the EDS row/cell wrapper before we discard it.
  const cell = el.querySelector(':scope > div > div');
  if (cell) preserveMepAttrs(cell.parentElement, el);

  // Walk the FLAT content in document order (querySelectorAll preserves order and
  // pierces the EDS wrapper divs). Pictures classify as media vs badge by <source>.
  const ordered = [...el.querySelectorAll('h2, h3, p, picture')];

  let title = null;
  const tiles = [];
  let current = null;
  let pendingBadges = [];

  for (const node of ordered) {
    switch (node.tagName) {
      case 'H2':
        if (!title) title = node;
        break;
      case 'PICTURE':
        if (isMediaPicture(node)) {
          current = { media: node, badges: pendingBadges, heading: null, bodies: [] };
          tiles.push(current);
          pendingBadges = [];
        } else {
          pendingBadges.push(node);
        }
        break;
      case 'H3':
        if (current && !current.heading) current.heading = node;
        else if (current) current.bodies.push(node);
        break;
      case 'P':
        if (current) current.bodies.push(node);
        break;
      default:
        break;
    }
  }
  // Defensive: any trailing badges with no media attach to the last tile.
  if (pendingBadges.length && current) current.badges.push(...pendingBadges);

  // Nothing recognizable — leave the authored DOM untouched.
  if (!tiles.length && !title) {
    el.dataset.forgeAuthored = BLOCK;
    return;
  }

  const inner = tag('div', 'section-inner');
  if (title) {
    title.classList.add('t-title3', 'ink-white', 'usecase-title');
    inner.appendChild(title);
  }

  const grid = tag('div', 'usecase-grid');
  for (let i = 0; i < tiles.length; i += TILES_PER_ROW) {
    const row = tag('div', 'bento-row');
    tiles.slice(i, i + TILES_PER_ROW).forEach((t) => row.appendChild(buildTile(t)));
    grid.appendChild(row);
  }
  if (grid.children.length) inner.appendChild(grid);

  el.replaceChildren(inner);
  el.dataset.forgeAuthored = BLOCK;
}
