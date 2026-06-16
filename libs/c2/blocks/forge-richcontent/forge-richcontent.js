/**
 * forge-richcontent — a full-width dark "rich content" hero band: a covering
 * background image under a top/bottom scrim, an app-id eyebrow (Creative Cloud
 * mnemonic + label), a large title, and a row of jump-links (each a labelled
 * down-arrow icon button) anchored to the bottom of the band.
 *
 * CRITICAL (DA serialization): at runtime DA strips the authored structural
 * classes (.bg / .scrim / .section-inner / .rc-top / .rc-links / .app-id …) and
 * hands `init(el)` a FLAT, class-less run of <picture>/<p>/<h2>/<a> in document
 * order. So this decorator never reads authored classes — it PROBES BY CONTENT
 * (C2), then REBUILDS the visual structure with createElement and commits it
 * once via el.replaceChildren(). The scoped CSS keys only on the classes this
 * file stamps, so it renders identically in production and in the test fixture.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: libs/c2/blocks/<name>/ -> libs/utils/ is THREE hops up
// (blocks -> c2 -> libs). Do NOT "correct" to 2 hops.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-richcontent';
const SVG_NS = 'http://www.w3.org/2000/svg';

// MEP / personalization markers Milo stamps on the row/cell wrapper we discard
// during the rebuild — copy them onto the block root FIRST so Target/MEP still
// finds them after replaceChildren().
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
  Object.entries(attrs).forEach(([k, v]) => { if (v != null) node.setAttribute(k, v); });
  if (content != null) {
    if (typeof content === 'string') node.textContent = content;
    else if (Array.isArray(content)) content.forEach((c) => c && node.append(c));
    else node.append(content);
  }
  return node;
}

// Decorative down-arrow used inside each jump-link's icon button. Built with the
// SVG namespace (never innerHTML) so it stays a real, paintable SVG node.
function downArrow() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 14 14');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M7 2v9M3 7l4 4 4-4');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.5');
  svg.append(path);
  return svg;
}

function slug(text) {
  return (text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'link';
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // The wrapper we'll discard (block > div > div) — lift MEP markers off it.
  const inner = el.querySelector(':scope > div > div') || el.querySelector(':scope > div');
  if (inner) preserveMepAttrs(inner.parentElement || inner, el);

  // --- Probe by content (NOT by class) ----------------------------------
  const bgPicture = el.querySelector('picture');
  // The app mnemonic is a bare <img> (no <picture> wrapper); the bg lives in a <picture>.
  const iconImg = [...el.querySelectorAll('img')].find((im) => !im.closest('picture'));
  const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
  const links = [...el.querySelectorAll('a[href]')];
  // Eyebrow = a paragraph with visible text and no anchor (bg paragraphs are text-empty).
  const eyebrowP = [...el.querySelectorAll('p')].find((p) => !p.querySelector('a') && p.textContent.trim());
  const eyebrowText = eyebrowP ? eyebrowP.textContent.trim() : '';

  // --- Rebuild the section structure ------------------------------------
  // Behind the content: covering background image + a top/bottom scrim.
  const behind = [];
  if (bgPicture) {
    const img = bgPicture.querySelector('img');
    if (img) img.setAttribute('daa-im', 'true');
    behind.push(createTag('div', { class: 'bg' }, bgPicture));
  }
  behind.push(createTag('div', { class: 'scrim' }));

  // Top cluster: app-id (icon + eyebrow) and the title.
  const rcTop = createTag('div', { class: 'rc-top' });
  const appId = createTag('div', { class: 'app-id' });
  if (iconImg) {
    iconImg.classList.add('icon-cc');
    iconImg.setAttribute('daa-im', 'true');
    if (!iconImg.getAttribute('width')) iconImg.setAttribute('width', '24');
    if (!iconImg.getAttribute('height')) iconImg.setAttribute('height', '23');
    appId.append(iconImg);
  }
  if (eyebrowText) appId.append(createTag('p', { class: 'rc-eyebrow t-eyebrow eyebrow' }, eyebrowText));
  if (appId.childElementCount) rcTop.append(appId);
  if (heading) {
    // Force an h2 — at most one h1 per block (L8/C8); title styling via .t-title2.
    const h = createTag('h2', { class: 'rc-h2 t-title2 title-2' }, heading.textContent.trim());
    rcTop.append(h);
  }

  // Bottom cluster: jump-links, each an icon button + label.
  const innerChildren = [rcTop];
  if (links.length) {
    const rcLinks = createTag('div', { class: 'rc-links' });
    links.forEach((a) => {
      const label = a.textContent.trim();
      const link = createTag('a', { class: 'rc-link', href: a.getAttribute('href') || '#' });
      preserveMepAttrs(a, link);
      link.setAttribute('daa-ll', slug(label));
      const iconBtn = createTag('span', { class: 'rc-iconbtn' });
      iconBtn.append(downArrow());
      link.append(iconBtn, createTag('span', { class: 't-h5 heading-xs' }, label));
      rcLinks.append(link);
    });
    innerChildren.push(rcLinks);
  }

  const sectionInner = createTag('div', { class: 'section-inner' }, innerChildren);
  el.replaceChildren(...behind, sectionInner);

  // Milo typography/analytics wiring (per-viewport-safe). Scoped to the top
  // cluster so jump-link labels keep their explicit jump-link styling.
  const decorate = (scope) => {
    const top = scope.querySelector?.('.rc-top') || scope;
    if (top && typeof decorateBlockText === 'function') decorateBlockText(top);
  };
  if (typeof decorateViewportContent === 'function') decorateViewportContent(el, decorate);
  else decorate(el);

  el.dataset.forgeAuthored = BLOCK;
}
