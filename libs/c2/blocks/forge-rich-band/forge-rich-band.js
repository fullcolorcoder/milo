/**
 * forge-rich-band — a Milo C2 block authored by Forge from a DISTINCTIVE Figma
 * section: a full-bleed hero "rich band" with a dusk photo background, a top
 * scrim gradient, an app-id row (Creative Cloud mnemonic + eyebrow) and a large
 * display headline anchored to the lower-left.
 *
 * DA strips authored classes and serializes the block as a FLAT, class-less run
 * of <picture>/<picture>/text/<h2> in document order — there is NO bg/scrim/
 * inner wrapper at runtime. So init() PROBES the flat content by shape (never by
 * an authored class or positional index) and RECONSTRUCTS the rich band with
 * createElement + classList.add, stamping its own .forge-rich-band-scoped hooks
 * that the co-located forge-rich-band.css keys on. The <picture> nodes are
 * MOVED, not cloned, so loading/srcset/sizes/width/height survive intact.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). The 3-hop '../../../' form is CORRECT.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-rich-band';

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

// The small foreground mnemonic <picture> is the one whose <img> carries tight
// explicit dimensions (24×23); the large dusk photo is the background. Probe by
// shape, never by index — the background may be authored first OR last.
function isIconPicture(pic) {
  const img = pic.querySelector('img');
  if (!img) return false;
  const w = parseInt(img.getAttribute('width') || '0', 10);
  return w > 0 && w <= 80;
}

// The eyebrow is the only running text outside the headline. Read it from a <p>
// when DA wrapped it, else from the first non-heading text node (DA often leaves
// short labels as bare text), so the probe is shape-driven, not class-driven.
function readEyebrow(el, heading) {
  const p = [...el.querySelectorAll('p')].find((n) => n.textContent.trim());
  if (p) return p.textContent.trim();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  let node = walker.nextNode();
  while (node) {
    const text = node.textContent.trim();
    if (text && !(heading && heading.contains(node))) return text;
    node = walker.nextNode();
  }
  return '';
}

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo; daa-ll stays section-owned).
  el.setAttribute('daa-lh', BLOCK);

  const pictures = [...el.querySelectorAll('picture')];
  const heading = el.querySelector('h1, h2, h3');
  const iconPic = pictures.find(isIconPicture) || null;
  const bgPic = pictures.find((p) => p !== iconPic) || pictures[0] || null;
  const eyebrow = readEyebrow(el, heading);

  // Nothing recognizable to rebuild — leave the authored DOM untouched.
  if (!bgPic && !heading) {
    el.dataset.forgeAuthored = BLOCK;
    return;
  }

  // Preserve MEP markers from the cell wrapper onto the root before we swap.
  const wrapper = el.querySelector(':scope > div > div') || el.querySelector(':scope > div');
  preserveMepAttrs(wrapper, el);

  // RECONSTRUCT: [bg picture] + [scrim] + section-inner > rb-inner > rb-top
  //              ( app-id [cc + eyebrow] , headline ).
  const parts = [];

  if (bgPic) {
    bgPic.classList.add('bg');
    const bgImg = bgPic.querySelector('img');
    if (bgImg) bgImg.setAttribute('daa-im', 'true');
    parts.push(bgPic);
  }

  parts.push(createTag('div', 'scrim'));

  const inner = createTag('div', 'section-inner');
  const rbInner = createTag('div', 'rb-inner');
  const rbTop = createTag('div', 'rb-top');

  if (iconPic || eyebrow) {
    const appId = createTag('span', 'app-id');
    if (iconPic) {
      iconPic.classList.add('cc');
      const icon = iconPic.querySelector('img');
      if (icon) icon.setAttribute('daa-im', 'true');
      appId.appendChild(iconPic);
    }
    if (eyebrow) {
      const eb = createTag('span', 't-eyebrow eyebrow-white');
      eb.textContent = eyebrow;
      appId.appendChild(eb);
    }
    rbTop.appendChild(appId);
  }

  if (heading) {
    heading.classList.add('t-title2', 'title-2');
    rbTop.appendChild(heading);
  }

  rbInner.appendChild(rbTop);
  inner.appendChild(rbInner);
  parts.push(inner);

  // Single swap — no innerHTML wipe; authored nodes are MOVED into the new tree.
  el.replaceChildren(...parts);

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
