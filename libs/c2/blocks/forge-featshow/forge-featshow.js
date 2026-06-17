/**
 * forge-featshow — a Milo C2 block authored by Forge from a Figma section that
 * matched no existing catalog block (a DISTINCTIVE feature-showcase section).
 *
 * THE RUNTIME SHAPE (author-content.html): DA serializes this block's content as
 * a FLAT, class-less run of semantic nodes in document order — here just a
 * `<picture>` (the large app-showcase window) followed by an `<a>` ("Free
 * trial"). The Figma `.featshow` / `.featshow-window` / `.btn-outline` classes
 * are STRIPPED before init() runs, so this decorator PROBES by content shape
 * (never by authored class, never positionally) and RECONSTRUCTS the rich
 * centered layout: a rounded, shadowed window framing the showcase image with a
 * pill CTA below it, on a peachy radial-gradient stage. The scoped
 * forge-featshow.css keys ONLY on the classes stamped here.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). Keep the 3-hop '../../../' specifier.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-featshow';

// MEP / personalization markers Milo stamps on the row/cell wrapper. The
// rebuild discards those wrappers, so copy any present marker up onto the block
// root FIRST — a node swap that drops them silently disables Target/MEP.
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

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Lift MEP markers off the EDS row/cell wrappers before we rebuild the block.
  const inner = el.querySelector(':scope > div > div');
  if (inner) {
    preserveMepAttrs(inner.parentElement, el);
    preserveMepAttrs(inner, el);
  }

  // PROBE by content shape (C2): the showcase media and the CTA link. querySelector
  // searches descendants regardless of the EDS wrapper depth, so this is robust
  // whether the content arrives wrapped or flat.
  const picture = el.querySelector('picture');
  const lonelyImg = !picture ? el.querySelector('img') : null;
  const cta = el.querySelector('a[href]');

  // RECONSTRUCT the rich centered layout with createElement (move nodes, never
  // serialize — preserves <source>/<img> attrs, loading="lazy", srcset, MEP).
  const stage = document.createElement('div');
  stage.className = 'forge-featshow-inner';

  const media = picture || lonelyImg;
  if (media) {
    const win = document.createElement('div');
    win.className = 'forge-featshow-window';
    win.appendChild(media);
    const img = win.querySelector('img');
    if (img) img.setAttribute('daa-im', 'true');
    stage.appendChild(win);
  }

  if (cta) {
    const ctaWrap = document.createElement('div');
    ctaWrap.className = 'forge-featshow-cta';
    cta.classList.add('con-button', 'outline', 'forge-featshow-button');
    cta.setAttribute('daa-ll', (cta.textContent || '').trim() || 'cta');
    ctaWrap.appendChild(cta);
    stage.appendChild(ctaWrap);
  }

  // Single swap once the rebuilt tree is ready (C3 — no innerHTML wipe).
  el.replaceChildren(stage);

  // Promote any text to C2 typography via Milo's own service, wrapped in
  // decorateViewportContent so per-viewport authored tables each decorate.
  const decorate = (scope) => { if (scope) decorateBlockText(scope); };
  if (typeof decorateViewportContent === 'function') {
    decorateViewportContent(el, () => decorate(stage));
  } else {
    decorate(stage);
  }

  el.dataset.forgeAuthored = BLOCK;
}
