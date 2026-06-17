/**
 * forge-jumplink — a Milo C2 block authored by Forge for a full-bleed dark hero
 * banner ("jumplink") that matched no existing catalog block.
 *
 * DA serializes a block's content as a FLAT, class-LESS run of semantic nodes in
 * document order — for this section that is:
 *   <picture> (background photo)  →  <picture> (app-mnemonic svg)  →
 *   <p> (eyebrow)  →  <h2> (title)
 * There is NO scrim/inner wrapper and NONE of the Figma classes
 * (.jumplink-bg/.section-inner/.app-id/…) survive. So init() PROBES by content
 * shape (never by an authored class or a fixed index) and RECONSTRUCTS the
 * layered hero: an absolutely-positioned background <picture>, a gradient scrim,
 * then a relative .section-inner > .jumplink-content holding the eyebrow row
 * (.app-id = icon + label) and the title. The scoped forge-jumplink.css keys
 * ONLY on the classes stamped here.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). Do NOT 'correct' it to 2 hops.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-jumplink';

// MEP / personalization markers Milo stamps on the row/cell wrapper. The
// wipe-and-rebuild discards that wrapper, so copy any present marker up onto the
// block root FIRST — a node swap that drops them silently disables Target/MEP.
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

// A picture is the small app-mnemonic icon when its image is an SVG or carries
// an empty alt (decorative); anything else with a raster source is the hero
// background photo. Probe by shape — never by an authored class (DA strips them).
function isIconPicture(picture) {
  const img = picture.querySelector('img');
  if (!img) return false;
  const src = img.getAttribute('src') || img.getAttribute('srcset') || '';
  return /\.svg(\?|$)/i.test(src) || (img.getAttribute('alt') || '').trim() === '';
}

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Lift MEP markers off the row/cell wrapper before we rebuild.
  const wrapper = el.querySelector(':scope > div > div')?.parentElement;
  preserveMepAttrs(wrapper, el);

  // PROBE the flat content by shape (account for every node, no fixed indices).
  const pictures = [...el.querySelectorAll('picture')];
  const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
  const eyebrow = el.querySelector('p');

  const iconPicture = pictures.find(isIconPicture) || null;
  const bgPicture = pictures.find((p) => p !== iconPicture) || null;

  // RECONSTRUCT the layered hero into a detached fragment, MOVING the authored
  // nodes (never cloning) so picture/source/img attributes + MEP markers survive.
  const frag = document.createDocumentFragment();

  if (bgPicture) {
    bgPicture.classList.add('jumplink-bg');
    bgPicture.querySelector('img')?.setAttribute('daa-im', 'true');
    frag.appendChild(bgPicture);
  }

  // Gradient scrim so the white type stays legible over the photo.
  frag.appendChild(tag('div', 'jumplink-scrim'));

  const inner = tag('div', 'section-inner');
  const content = tag('div', 'jumplink-content');

  if (iconPicture || eyebrow) {
    const appId = tag('div', 'app-id');
    if (iconPicture) {
      iconPicture.classList.add('app-id-icon');
      appId.appendChild(iconPicture);
    }
    if (eyebrow) {
      eyebrow.classList.add('t-eyebrow', 'ink-white');
      appId.appendChild(eyebrow);
    }
    content.appendChild(appId);
  }

  if (heading) {
    heading.classList.add('t-title2', 'ink-white');
    content.appendChild(heading);
  }

  inner.appendChild(content);
  frag.appendChild(inner);

  // Single wipe-and-rebuild (no innerHTML reset — preserves any other authored DOM).
  el.replaceChildren(frag);

  // Promote text to C2 typography via Milo's own service, additively, on the
  // content column. Wrapped in decorateViewportContent so per-viewport tables
  // each decorate; guarded so a single-viewport table still decorates once.
  const decorate = (scope) => {
    const target = scope?.querySelector?.('.jumplink-content') || scope;
    if (target) decorateBlockText(target);
  };
  if (typeof decorateViewportContent === 'function') {
    decorateViewportContent(el, decorate);
  } else {
    decorate(el);
  }

  el.dataset.forgeAuthored = BLOCK;
}
