/**
 * forge-merch — a Milo C2 block authored by Forge for the centered "Get Creative
 * Cloud Pro today." merchandising section (Figma 392:15094) on a dark band.
 *
 * DA serializes a block's content as a FLAT, class-LESS run of semantic nodes in
 * document order: the CC composite badge (TWO adjacent SVG <picture>s), an
 * eyebrow <p>, the <h2> title, a description <p> and a pricing <p> (with an inline
 * "See terms" link), two standalone CTA <a>s, then the hero merch <picture> (with
 * <source>/loading="lazy"). The authored lockup/copy/button/media wrappers and
 * their classes DO NOT survive into runtime, so this decorator PROBES the flat run
 * by content shape (never by class), RECONSTRUCTS the centered lockup with
 * createTag, and stamps its own `.forge-merch`-scoped classes the scoped stylesheet
 * keys on. The two SVG pictures fold into one `.cc-ico` composite badge; the only
 * picture carrying <source>/loading="lazy" is the hero merch image.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/* is THREE hops up
// (blocks -> c2 -> libs). Do NOT "correct" this to 2 hops.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-merch';

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

// The hero merch photo carries responsive <source>s and/or loading="lazy"; the CC
// badge mnemonics are bare <picture><img></picture> with neither. Probing by
// STRUCTURE (not by .svg src) keeps grouping identical in prod and in the
// data-URI test fixture.
function isPhoto(node) {
  const img = imgOf(node);
  if (!img) return false;
  return !!node.querySelector?.('source') || img.getAttribute('loading') === 'lazy';
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
  const title = nodes.find((n) => n.matches?.('h1, h2'));
  const titleIdx = title ? nodes.indexOf(title) : -1;

  // Walk the flat run, accounting for EVERY node by content shape.
  const iconPics = [];
  let photo = null;
  const ctas = [];
  const eyebrowPs = [];
  const bodyPs = [];
  nodes.forEach((node, i) => {
    if (node === title) return;
    if (node.matches?.('picture, img')) {
      if (isPhoto(node)) photo = node;
      else iconPics.push(node);
    } else if (node.tagName === 'A') {
      ctas.push(node); // standalone CTA (inline links stay inside their <p>)
    } else if (node.tagName === 'P') {
      if (titleIdx >= 0 && i < titleIdx) eyebrowPs.push(node);
      else bodyPs.push(node);
    }
  });

  // --- Reconstruct the centered lockup ---
  const headwrap = createTag('div', { class: 'merch-headwrap' });

  // App-id badge: fold the two adjacent SVG pictures into one .cc-ico composite
  // (tile background + centered mnemonic) + the eyebrow label.
  const appId = createTag('div', { class: 'app-id' });
  if (iconPics.length) {
    const ico = createTag('span', { class: 'cc-ico' });
    const tile = imgOf(iconPics[0]);
    const mn = iconPics[1] ? imgOf(iconPics[1]) : null;
    if (tile) { tile.classList.add('cc-ico-tile'); tile.setAttribute('daa-im', 'true'); ico.append(tile); }
    if (mn) { mn.classList.add('cc-ico-mn'); mn.setAttribute('daa-im', 'true'); ico.append(mn); }
    appId.append(ico);
  }
  eyebrowPs.forEach((p) => { p.classList.add('t-eyebrow', 'ink-white'); appId.append(p); });
  if (appId.children.length) headwrap.append(appId);

  if (title) { title.classList.add('t-title2', 'ink-white'); headwrap.append(title); }

  const lockup = createTag('div', { class: 'merch-lockup' }, headwrap);
  if (bodyPs.length) {
    const sub = createTag('div', { class: 'merch-sub' });
    bodyPs.forEach((p) => { p.classList.add('t-body-lg', 'ink-white'); sub.append(p); });
    lockup.append(sub);
  }

  const copy = createTag('div', { class: 'merch-copy' }, lockup);

  if (ctas.length) {
    const btns = createTag('div', { class: 'merch-btns' });
    ctas.forEach((a, i) => {
      a.classList.add(i === 0 ? 'btn-primary' : 'btn-outline', 't-label');
      a.setAttribute('daa-ll', (a.textContent || `cta-${i + 1}`).trim().slice(0, 40));
      btns.append(a);
    });
    copy.append(btns);
  }

  // Single commit — never wipe innerHTML; move-and-replace preserves DOM nodes
  // (and their MEP/personalization attributes) the rebuild reuses.
  const rebuilt = [copy];
  if (photo) {
    imgOf(photo)?.setAttribute('daa-im', 'true');
    rebuilt.push(createTag('div', { class: 'merch-img' }, photo));
  }
  el.replaceChildren(...rebuilt);

  // Run Milo's own text decorator over the copy cluster for analytics + a11y
  // wiring (typography is owned by the scoped CSS). Guarded so a service hiccup
  // never bricks the reconstructed section.
  try {
    const runText = (scope) => (scope || el)
      .querySelectorAll('.merch-copy')
      .forEach((c) => decorateBlockText?.(c));
    if (typeof decorateViewportContent === 'function') decorateViewportContent(el, runText);
    else runText(el);
  } catch (e) {
    window.lana?.log?.(`${BLOCK} decorate: ${e?.message || e}`);
  }

  el.dataset.forgeAuthored = BLOCK;
}
