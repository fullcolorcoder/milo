/**
 * forge-bento — a Milo C2 block authored by Forge from a Figma section that
 * matched no existing catalog block (a DISTINCTIVE "what's new" bento section).
 *
 * THE RUNTIME SHAPE (author-content.html): DA serializes this block's content as
 * a FLAT, class-less run of semantic nodes in document order:
 *   <p> eyebrow, <h2> title,
 *   <picture> (large feature "bottle"), <h3> + <p> (feature copy),
 *   <picture> + "Harmonize" (bare label text) + <h3> + <p>  (card 1),
 *   <picture> + <h3> + <p>                                  (card 2).
 * The Figma `.bento` / `.bento-head` / `.bento-row` / `.bento-card` classes are
 * STRIPPED before init() runs, so this decorator PROBES by content shape (never
 * by authored class, never positionally) and RECONSTRUCTS the rich layout: a
 * centered head, a rounded full-width feature image with copy below it, and a
 * 2-up card row. The scoped forge-bento.css keys ONLY on the classes stamped
 * here.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). Keep the 3-hop '../../../' specifier.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-bento';

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

function createTag(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

const isPicture = (n) => n.nodeType === 1 && (n.matches('picture') || n.tagName === 'IMG');
const isHeading = (n) => n.nodeType === 1 && /^H[1-6]$/.test(n.tagName);
const significant = (n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim());

function markImage(scope) {
  const img = scope.querySelector?.('img');
  if (img) img.setAttribute('daa-im', 'true');
}

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Lift the single content cell's children to the block root so traversal sees
  // the flat content, preserving MEP markers off the discarded EDS wrappers.
  const inner = el.querySelector(':scope > div > div');
  if (inner) {
    preserveMepAttrs(inner.parentElement, el);
    preserveMepAttrs(inner, el);
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  // PROBE by content shape (C2): the flat run of significant nodes in order.
  const flat = [...el.childNodes].filter(significant);
  const title = flat.find((n) => n.nodeType === 1 && n.tagName === 'H2');
  const titleIdx = title ? flat.indexOf(title) : Infinity;
  // Eyebrow: the first <p> that appears BEFORE the title (the kicker line).
  const eyebrow = flat.find(
    (n, i) => n.nodeType === 1 && n.tagName === 'P' && i < titleIdx,
  );

  // Segment everything after the head by <picture> boundaries: the first
  // segment is the full-width feature, the rest are cards.
  const rest = flat.filter((n) => n !== eyebrow && n !== title);
  const segments = [];
  let cur = null;
  for (const n of rest) {
    if (isPicture(n)) {
      cur = { media: n, items: [] };
      segments.push(cur);
    } else if (cur) {
      cur.items.push(n);
    }
  }

  // RECONSTRUCT the rich layout with createElement (move nodes, never serialize —
  // preserves <source>/<img> attrs, loading="lazy", srcset, MEP).
  const innerWrap = createTag('div', 'forge-bento-inner');

  // Head: eyebrow + title, centered.
  const head = createTag('div', 'forge-bento-head');
  if (eyebrow) { eyebrow.classList.add('forge-bento-eyebrow'); head.appendChild(eyebrow); }
  if (title) { title.classList.add('forge-bento-title'); head.appendChild(title); }
  if (head.childNodes.length) innerWrap.appendChild(head);

  // Feature (first segment): a rounded full-width image with copy below it.
  const feature = segments.shift();
  if (feature) {
    const featureEl = createTag('div', 'forge-bento-feature');
    const media = createTag('div', 'forge-bento-feature-media');
    media.appendChild(feature.media);
    markImage(media);
    featureEl.appendChild(media);
    const copy = createTag('div', 'forge-bento-feature-copy');
    for (const item of feature.items) {
      if (item.nodeType === 3) continue;
      copy.appendChild(item);
    }
    if (copy.childNodes.length) featureEl.appendChild(copy);
    innerWrap.appendChild(featureEl);
  }

  // Cards: remaining segments laid out in a responsive row.
  if (segments.length) {
    const row = createTag('div', 'forge-bento-row');
    for (const seg of segments) {
      const card = createTag('div', 'forge-bento-card');
      const media = createTag('div', 'forge-bento-card-media');
      media.appendChild(seg.media);
      markImage(media);
      card.appendChild(media);
      let seenHeading = false;
      for (const item of seg.items) {
        if (item.nodeType === 3) {
          // Bare label text DA left between the media and the heading.
          const text = item.textContent.trim();
          if (text && !seenHeading) card.appendChild(createTag('span', 'forge-bento-card-label', text));
        } else if (isHeading(item)) {
          seenHeading = true;
          item.classList.add('forge-bento-card-title');
          card.appendChild(item);
        } else if (!seenHeading && item.tagName === 'P') {
          // A short paragraph before the heading is the eyebrow-style label.
          card.appendChild(createTag('span', 'forge-bento-card-label', (item.textContent || '').trim()));
        } else {
          item.classList?.add('forge-bento-card-body');
          card.appendChild(item);
        }
      }
      row.appendChild(card);
    }
    innerWrap.appendChild(row);
  }

  // Single swap once the rebuilt tree is ready (C3 — no innerHTML wipe).
  el.replaceChildren(innerWrap);

  // Promote text to C2 typography via Milo's own service, wrapped in
  // decorateViewportContent so a per-viewport authored table decorates each
  // variation; the no-variation branch decorates the single table once.
  const decorate = (scope) => { if (scope) decorateBlockText(scope); };
  if (typeof decorateViewportContent === 'function') {
    decorateViewportContent(el, () => decorate(innerWrap));
  } else {
    decorate(innerWrap);
  }

  el.dataset.forgeAuthored = BLOCK;
}
