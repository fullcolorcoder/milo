/**
 * forge-roller — a Milo C2 block authored by Forge for a distinctive section that
 * matched no existing catalog block (R3 below-threshold, closest: news).
 *
 * The section is a dark, full-width "app roller": a left column with an eyebrow +
 * title and a tall, faded vertical list of app names (one highlighted as active),
 * and a right column holding a rounded media card with a small app-mnemonic icon
 * overlaid top-left.
 *
 * DA strips authored classes (checklist C24): at runtime init(el) receives a FLAT,
 * class-less run of <p>/<h2>/<picture> in document order — NO grid/row/list
 * wrappers. So this decorator PROBES by content shape + order (never by an authored
 * class, never by a fixed child index) and RECONSTRUCTS the rich layout with
 * createElement + appendChild, stamping its own .forge-roller-scoped classes that
 * the scoped CSS keys on.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is THREE
// hops up (blocks -> c2 -> libs). The 3-hop '../../../' form is CORRECT.
import { decorateBlockText } from '../../../utils/decorate.js';

const BLOCK = 'forge-roller';

// MEP / personalization markers Milo stamps on the row/cell wrapper. The un-wrap
// discards that wrapper, so copy any present marker up onto the block root FIRST.
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

function tag(name, cls, parent) {
  const node = document.createElement(name);
  if (cls) node.className = cls;
  if (parent) parent.appendChild(node);
  return node;
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // Un-wrap EDS row/cell wrappers, lifting MEP markers up first.
  const inner = el.querySelector(':scope > div > div');
  if (inner) {
    preserveMepAttrs(inner.parentElement, el);
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  // --- Probe the FLAT, class-less DA content by shape + order (C2/C24). ---
  const kids = [...el.children].filter((n) => n.nodeType === 1);
  const title = kids.find((n) => /^H[1-6]$/.test(n.tagName));
  const pics = kids.filter((n) => n.tagName === 'PICTURE' || n.tagName === 'IMG');
  const paras = kids.filter((n) => n.tagName === 'P');

  // eyebrow = the <p> that precedes the title (fallback: first <p>).
  let eyebrow = null;
  if (title) {
    eyebrow = paras.find((p) => p.compareDocumentPosition(title)
      & Node.DOCUMENT_POSITION_FOLLOWING) || null;
  }
  if (!eyebrow && paras.length) [eyebrow] = paras;

  // Remaining <p>s after the eyebrow: first = category label ("Video"),
  // the rest = the roller app list.
  const rest = paras.filter((p) => p !== eyebrow);
  const categoryLabel = rest.length ? rest[0] : null;
  const appItems = rest.slice(1);

  // Media: a <picture> carrying <source> is the main media; a sourceless
  // picture/img is the app-mnemonic icon. Fall back to document order.
  let iconPic = null;
  let mediaPic = null;
  for (const p of pics) {
    const hasSource = p.tagName === 'PICTURE' && p.querySelector('source');
    if (hasSource) mediaPic = p;
    else iconPic = iconPic || p;
  }
  if (!mediaPic && pics.length) mediaPic = pics[pics.length - 1];
  if (!iconPic && pics.length > 1) [iconPic] = pics;
  const mediaImg = mediaPic?.querySelector('img');
  const iconImg = iconPic?.tagName === 'IMG' ? iconPic : iconPic?.querySelector('img');

  // --- Reconstruct the rich layout (createElement + appendChild). ---
  // Blurred full-bleed backdrop built from the media image src.
  const bg = tag('div', 'roller-bg');
  const bgSrc = mediaImg?.getAttribute('src');
  if (bgSrc) bg.style.backgroundImage = `url("${bgSrc}")`;

  const sectionInner = tag('div', 'section-inner');
  const left = tag('div', 'roller-left', sectionInner);

  const head = tag('div', 'roller-head', left);
  if (eyebrow) {
    eyebrow.classList.add('t-eyebrow', 'ink-white');
    head.appendChild(eyebrow);
  }
  if (title) {
    title.classList.add('t-title2', 'ink-white');
    head.appendChild(title);
  }

  const carousel = tag('div', 'roller-carousel', left);
  const vidTitle = tag('div', 'roller-vid-title', carousel);
  const vidSpan = tag('span', 't-h6 ink-white', vidTitle);
  vidSpan.textContent = categoryLabel ? categoryLabel.textContent.trim() : 'Video';
  tag('div', 'roller-divider', carousel);
  const win = tag('div', 'roller-window', carousel);
  const list = tag('div', 'roller-list', win);

  // Mark the active app: match the icon's alt text; otherwise pick a stable
  // mid-list item so exactly one is always active (never an empty highlight).
  const activeName = (iconImg?.getAttribute('alt') || '').trim().toLowerCase();
  let activeSet = false;
  for (const p of appItems) {
    p.classList.add('t-super', 'roller-app');
    if (!activeSet && activeName && p.textContent.trim().toLowerCase() === activeName) {
      p.classList.add('is-active');
      activeSet = true;
    }
    list.appendChild(p);
  }
  if (!activeSet && appItems.length) {
    appItems[Math.min(5, appItems.length - 1)].classList.add('is-active');
  }

  const right = tag('div', 'roller-right', sectionInner);
  const mediaWrap = tag('div', 'roller-media', right);
  if (iconImg) {
    iconImg.classList.add('roller-media-icon');
    iconImg.setAttribute('daa-im', 'true');
    mediaWrap.appendChild(iconImg);
  }
  if (mediaPic) {
    if (mediaImg) mediaImg.setAttribute('daa-im', 'true');
    mediaWrap.appendChild(mediaPic);
  }

  // Run Milo's text decorator over the head (analytics + a11y wiring), guarded so
  // the block still renders if the service is unavailable or throws.
  try {
    if (typeof decorateBlockText === 'function') decorateBlockText(head, ['m', 'l', 'm']);
  } catch (e) { /* non-fatal: keep the reconstructed layout */ }

  // Single replace at the end (never innerHTML='' — C3); the moved nodes already
  // live inside sectionInner, so this just drops any leftover wrappers.
  el.replaceChildren(bg, sectionInner);
  el.dataset.forgeAuthored = BLOCK;
}
