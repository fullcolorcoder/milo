/**
 * forge-jtbd — a Milo C2 block authored by Forge from a Figma section that
 * matched no existing catalog block (a DISTINCTIVE "jobs-to-be-done" bento of
 * capability cards).
 *
 * THE RUNTIME SHAPE (author-content.html): DA serializes this block's content as
 * a FLAT, class-less run of semantic nodes in document order — an eyebrow <p>,
 * the section <h2>, a sub <p>, then a repeating run of card pieces (<h3>, <p>,
 * <picture>) where the FIRST card is text-first (h3,p,picture) and the rest are
 * media-first (picture,h3,p). The Figma .jtbd-grid/.jtbd-row/.card-* classes are
 * STRIPPED before init() runs, so this decorator PROBES by content shape (never
 * by authored class, never positionally on el.children) and RECONSTRUCTS the
 * rich bento: a centered head + a 3-row grid of capability cards (a blue
 * feature card, plain media cards with a caption below, a narrow card, and a
 * full-bleed overlay card). The scoped forge-jtbd.css keys ONLY on the classes
 * stamped here.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). Keep the 3-hop '../../../' specifier.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-jtbd';

// MEP / personalization markers Milo stamps on the row/cell wrapper. The rebuild
// discards those wrappers, so copy any present marker up onto the block root
// FIRST — a node swap that drops them silently disables Target/MEP.
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

// Build one capability card from a content cluster ({ media, heading, body }).
// The card style is driven by its position in the bento: index 0 is the blue
// feature card (copy above the image), the LAST card is the full-bleed overlay
// card (copy laid over the image), the second-to-last is the narrow tall card,
// everything else is a plain media card (image with a caption below).
function buildCard(cluster, index, total) {
  const card = document.createElement('div');
  card.className = 'forge-jtbd-card';
  const isFeature = index === 0;
  const isOverlay = index === total - 1 && total > 1;
  const isNarrow = total >= 5 && index === total - 2;
  if (isFeature) card.classList.add('forge-jtbd-card--feature');
  else if (isOverlay) card.classList.add('forge-jtbd-card--overlay');
  else if (isNarrow) card.classList.add('forge-jtbd-card--narrow');
  else card.classList.add('forge-jtbd-card--media');

  let media = null;
  if (cluster.media) {
    media = document.createElement('div');
    media.className = 'forge-jtbd-media';
    media.appendChild(cluster.media); // move, never serialize (keeps srcset/lazy)
    const img = media.querySelector('img');
    if (img) img.setAttribute('daa-im', 'true');
  }

  let copy = null;
  if (cluster.heading || cluster.body) {
    copy = document.createElement('div');
    copy.className = 'forge-jtbd-copy';
    if (cluster.heading) {
      cluster.heading.classList.add('forge-jtbd-card-title');
      copy.appendChild(cluster.heading);
    }
    if (cluster.body) {
      cluster.body.classList.add('forge-jtbd-card-body');
      copy.appendChild(cluster.body);
    }
  }

  // Feature card stacks copy ABOVE the image; every other card leads with the
  // image (the overlay card's copy is positioned over it via CSS).
  if (isFeature) {
    if (copy) card.appendChild(copy);
    if (media) card.appendChild(media);
  } else {
    if (media) card.appendChild(media);
    if (copy) card.appendChild(copy);
  }
  return card;
}

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Lift MEP markers off the EDS row/cell wrappers before we rebuild.
  const inner = el.querySelector(':scope > div > div');
  if (inner) {
    preserveMepAttrs(inner.parentElement, el);
    preserveMepAttrs(inner, el);
  }

  // PROBE by content shape (C2): collect the flat semantic flow in document
  // order, regardless of how deep the EDS wrappers nest it.
  const flow = [...el.querySelectorAll('h2, h3, p, picture')];
  if (!flow.length) {
    el.dataset.forgeAuthored = BLOCK;
    return;
  }

  // HEAD = the leading nodes before the first card heading (h3).
  const firstCardIdx = flow.findIndex((n) => n.tagName === 'H3');
  const headNodes = firstCardIdx === -1 ? flow.slice() : flow.slice(0, firstCardIdx);
  const cardNodes = firstCardIdx === -1 ? [] : flow.slice(firstCardIdx);

  // CLUSTER the card nodes into { media, heading, body }. A repeated slot starts
  // a new card — this tolerates BOTH text-first (h3,p,picture) and media-first
  // (picture,h3,p) card orderings without reading positions.
  const slotOf = (n) => {
    if (n.tagName === 'PICTURE') return 'media';
    if (n.tagName === 'H3') return 'heading';
    return 'body';
  };
  const clusters = [];
  let cur = null;
  for (const n of cardNodes) {
    const slot = slotOf(n);
    if (!cur || cur[slot]) { cur = {}; clusters.push(cur); }
    cur[slot] = n;
  }

  // RECONSTRUCT the centered head.
  const head = document.createElement('div');
  head.className = 'forge-jtbd-head';
  let pSeen = 0;
  for (const n of headNodes) {
    if (n.tagName === 'H2') {
      n.classList.add('forge-jtbd-title');
    } else if (n.tagName === 'P') {
      n.classList.add(pSeen === 0 ? 'forge-jtbd-eyebrow' : 'forge-jtbd-sub');
      if (pSeen === 0) n.classList.add('eyebrow');
      pSeen += 1;
    }
    head.appendChild(n);
  }

  // RECONSTRUCT the bento grid: cards paired into rows of two.
  const grid = document.createElement('div');
  grid.className = 'forge-jtbd-grid';
  const cards = clusters.map((c, i) => buildCard(c, i, clusters.length));
  for (let i = 0; i < cards.length; i += 2) {
    const row = document.createElement('div');
    row.className = 'forge-jtbd-row';
    row.appendChild(cards[i]);
    if (cards[i + 1]) row.appendChild(cards[i + 1]);
    grid.appendChild(row);
  }

  // Single swap once the rebuilt tree is ready (C3 — no innerHTML wipe).
  el.replaceChildren(head, grid);

  // Promote text to C2 typography via Milo's own service (additive — keeps the
  // classes the scoped CSS keys on), wrapped in decorateViewportContent so a
  // per-viewport authored table decorates each variation.
  const runDecorate = () => {
    try {
      decorateBlockText(head);
      grid.querySelectorAll('.forge-jtbd-copy').forEach((c) => decorateBlockText(c));
    } catch (e) { /* typography promotion is best-effort, never fatal */ }
  };
  if (typeof decorateViewportContent === 'function') {
    decorateViewportContent(el, runDecorate);
  } else {
    runDecorate();
  }

  el.dataset.forgeAuthored = BLOCK;
}
