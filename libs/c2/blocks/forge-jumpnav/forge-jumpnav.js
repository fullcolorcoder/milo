/**
 * forge-jumpnav — a Milo C2 "jump navigation" hero section: a full-width dark
 * band with a background photo + scrim, an eyebrow pill (brand mnemonic + label),
 * a large display title, and a row of in-page jump links (each a labelled
 * chevron tile that scrolls to an anchor on the page).
 *
 * DA authoring serializes block content as a FLAT, class-LESS run of nested
 * <div>s carrying only text + media in document order — the authored structural
 * classes (.jn-inner/.jn-top/.jn-links/.eyebrow-pill) DO NOT exist at runtime.
 * So init() PROBES the flat content by role (C2: query by content, never by
 * authored class or child index) and RECONSTRUCTS the visual structure with
 * createElement, stamping the scoped-CSS hooks itself, then commits the rebuilt
 * tree with a single replaceChildren (never innerHTML-wipes the authored DOM).
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/ is THREE hops up
// (blocks -> c2 -> libs). Do NOT "correct" this to 2 hops on stale prose.
import { decorateBlockText } from '../../../utils/decorate.js';

const BLOCK = 'forge-jumpnav';

// MEP / personalization markers Milo may stamp on a node. Copy them forward
// whenever we move content into a freshly-built node so a later Target/MEP swap
// still finds its hook (a node swap that drops them silently disables MEP).
const MEP_ATTRS = ['data-manifest-id', 'data-adobe-target-testid'];
function preserveMepAttrs(from, to) {
  if (!from || !to || !from.getAttribute) return;
  for (const attr of MEP_ATTRS) {
    const v = from.getAttribute(attr);
    if (v != null) to.setAttribute(attr, v);
  }
  for (const a of [...(from.attributes || [])]) {
    if (a.name.startsWith('data-mep-')) to.setAttribute(a.name, a.value);
  }
}

function ce(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

// Decorative Creative-Cloud-style mnemonic tile for the eyebrow pill. Inline SVG
// on a freshly-created span (never an innerHTML wipe of authored DOM).
function brandMnemonic() {
  const span = ce('span', 'jn-mnemonic');
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" focusable="false">'
    + '<rect width="24" height="24" rx="5" fill="#001e36"/>'
    + '<path d="M7.6 9.1a3.6 3.6 0 1 0 0 5.8" fill="none" stroke="#31a8ff" stroke-width="1.7" stroke-linecap="round"/>'
    + '<path d="M16.4 9.1a3.6 3.6 0 1 0 0 5.8" fill="none" stroke="#31a8ff" stroke-width="1.7" stroke-linecap="round"/>'
    + '</svg>';
  return span;
}

// Small down-chevron tile that precedes each jump-link label.
function chevronTile() {
  const span = ce('span', 'jn-ico');
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" focusable="false">'
    + '<path d="M7 2v8M3.5 6.5 7 10l3.5-3.5" stroke="currentColor" stroke-width="1.4" '
    + 'fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return span;
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // --- Probe the flat authored content by ROLE (never by class / index) ---
  const picture = el.querySelector('picture');
  const looseImg = picture ? null : el.querySelector('img');
  const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
  const anchors = [...el.querySelectorAll('a[href]')];
  const anchorSet = new Set(anchors);
  // Eyebrow: the first paragraph/span that carries text and is NOT a link host.
  const eyebrowEl = [...el.querySelectorAll('p, span')].find(
    (n) => n.textContent.trim() && !n.querySelector('a') && !anchorSet.has(n),
  );
  const eyebrowText = eyebrowEl ? eyebrowEl.textContent.trim() : '';

  // Lift any MEP markers from the wrapper chain onto the block root first.
  preserveMepAttrs(el.querySelector(':scope > div') || el, el);

  // --- Reconstruct the section structure ---
  const parts = [];

  // 1) Background media (preserve every <picture>/<img> attribute — C4/CLS).
  if (picture || looseImg) {
    const media = picture || looseImg;
    const img = media.tagName === 'IMG' ? media : media.querySelector('img');
    if (img) {
      img.classList.add('bg');
      img.setAttribute('daa-im', 'true');
    }
    media.classList.add('jn-bg');
    parts.push(media);
  }

  // 2) Scrim gradient overlay (top + bottom darkening for text contrast).
  parts.push(ce('div', 'jn-scrim'));

  // 3) Foreground content column.
  const inner = ce('div', 'jn-inner');
  inner.setAttribute('daa-lh', BLOCK);

  const top = ce('div', 'jn-top');
  if (eyebrowText) {
    const pill = ce('span', 'jn-eyebrow-pill');
    pill.append(brandMnemonic());
    const label = ce('span', 'jn-eyebrow eyebrow');
    label.textContent = eyebrowText;
    preserveMepAttrs(eyebrowEl, label);
    pill.append(label);
    top.append(pill);
  }
  if (heading) {
    // At most one h1 per block (C8): a hero band title is a sub-heading -> h2.
    const h2 = ce('h2', 'jn-title title-2');
    while (heading.firstChild) h2.appendChild(heading.firstChild);
    preserveMepAttrs(heading, h2);
    top.append(h2);
  }
  if (top.childElementCount) inner.append(top);

  // 4) Jump-link row — each is a real <a> (real in-page href, C9).
  if (anchors.length) {
    const links = ce('div', 'jn-links');
    anchors.forEach((a) => {
      const text = a.textContent.trim();
      const href = a.getAttribute('href') || '#';
      const link = ce('a', 'jn-link');
      link.href = href;
      link.setAttribute('daa-ll', text.slice(0, 40) || 'jump-link');
      preserveMepAttrs(a, link);
      link.append(chevronTile());
      const span = ce('span', 'jn-link-label title-h5');
      span.textContent = text;
      link.append(span);
      links.append(link);
    });
    inner.append(links);
  }

  parts.push(inner);

  // Single commit — replaceChildren never wipes authored DOM mid-flight (C3/L2).
  el.replaceChildren(...parts);

  // Run Milo's own text decorator over the foreground so headings/copy get the
  // C2 typography + a11y/analytics wiring (guarded — never let it break render).
  try {
    if (typeof decorateBlockText === 'function') decorateBlockText(inner);
  } catch (e) {
    /* non-fatal: structure already committed above */
  }

  el.dataset.forgeAuthored = BLOCK;
}
