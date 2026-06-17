/**
 * forge-plans — a Milo C2 block authored by Forge from a Figma section that
 * matched no existing catalog block (a DISTINCTIVE "Choose a plan" pricing
 * section with audience tabs and two comparison cards).
 *
 * THE RUNTIME SHAPE (author-content.html): DA serializes this block's content as
 * a FLAT, class-less run of semantic nodes + bare text in document order:
 *   <h2> title,
 *   "Individuals" / "Students & Teachers" / "Businesses"   (bare tab labels),
 *   <picture> + "Image editing" + <h3> + <p> + <p>price + <p>billing
 *     + <a>CTA + "Secure transaction" + ("Apps" + <ul>)…    (card 1, dark)
 *   <picture> + "All-in-one toolkit" + <h3> + <p> + <a>See terms
 *     + <p>old + <p>price + <p>billing + <a>CTA + "Secure transaction"
 *     + ("20+ apps" + <ul>)…                                (card 2, light)
 *   <a>See all plans                                        (footer button)
 * The Figma .plan-card / .plan-tabs / .feat-group classes are STRIPPED before
 * init() runs, so this decorator PROBES by content shape (never by authored
 * class, never positionally) and RECONSTRUCTS the rich layout: a centered head,
 * a pill tab group, a 2-up card row, and a centered footer button. The scoped
 * forge-plans.css keys ONLY on the classes stamped here.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). Keep the 3-hop '../../../' specifier.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-plans';

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

// Decorative inline icons built node-by-node (no innerHTML, no @keyframes — these
// are static marks, not motion).
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const k of Object.keys(attrs)) node.setAttribute(k, String(attrs[k]));
  return node;
}
const ICON_PATHS = {
  lock: [
    ['rect', { x: 2.5, y: 6, width: 9, height: 6, rx: 1, fill: 'none', stroke: 'currentColor' }],
    ['path', { d: 'M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6', fill: 'none', stroke: 'currentColor' }],
  ],
  apps: [['path', { d: 'M3 1h5l3 3v9H3z', fill: 'none', stroke: 'currentColor' }]],
  ai: [['path', { d: 'M7 1l1.3 4.4L13 7l-4.7 1.6L7 13l-1.3-4.4L1 7l4.7-1.6z', fill: '#c77dff' }]],
  extras: [['path', { d: 'M1 4h12M1 7h12M1 10h12', stroke: 'currentColor', fill: 'none' }]],
};
function iconSpan(name) {
  const span = createTag('span', 'forge-plans-ico');
  span.setAttribute('aria-hidden', 'true');
  const svg = svgEl('svg', { viewBox: '0 0 14 14', 'aria-hidden': 'true', focusable: 'false' });
  for (const [tag, attrs] of (ICON_PATHS[name] || ICON_PATHS.apps)) svg.appendChild(svgEl(tag, attrs));
  span.appendChild(svg);
  return span;
}
function headIcon(text) {
  const t = (text || '').toLowerCase();
  if (/\bai\b/.test(t)) return 'ai';
  if (/extra/.test(t)) return 'extras';
  return 'apps';
}

function markImage(scope) {
  const img = scope.querySelector?.('img');
  if (img) img.setAttribute('daa-im', 'true');
}

function slug(text) {
  return (text || 'link').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'link';
}

// Decorate Milo link-hash modifiers (#_button-fill etc.) per convention: read
// the modifier for styling, then strip it so the anchor href stays a real URL.
function readButtonFill(a) {
  const href = a.getAttribute('href') || '';
  const hasFill = /#_button-fill\b/.test(href);
  const clean = href.replace(/#_[a-z-]+/gi, '');
  a.setAttribute('href', clean || '#');
  return hasFill;
}

// Build a flat token stream: ELEMENT children stay whole; top-level TEXT nodes
// are split on newlines into individual trimmed lines (DA collapses adjacent
// authored cells into one text node, so a line is the reliable unit).
function buildTokens(el) {
  const tokens = [];
  for (const node of el.childNodes) {
    if (node.nodeType === 3) {
      for (const line of node.textContent.split('\n')) {
        const t = line.trim();
        if (t) tokens.push({ kind: 'text', text: t });
      }
    } else if (node.nodeType === 1) {
      tokens.push({ kind: 'el', node, tag: node.tagName });
    }
  }
  return tokens;
}

const isMedia = (t) => t.kind === 'el' && (t.tag === 'PICTURE' || t.tag === 'IMG');

function parseCard(seg) {
  const card = {
    mnemonic: seg.media, eyebrow: '', title: null, desc: null,
    seeTerms: null, prices: [], billing: null, cta: null, secure: '', features: [],
  };
  let pendingText = '';
  for (const it of seg.items) {
    if (it.kind === 'text') {
      const txt = it.text;
      if (!card.title && !card.eyebrow) { card.eyebrow = txt; continue; }
      if (/secure/i.test(txt)) { card.secure = txt; continue; }
      pendingText = txt; // a feature head waiting for its <ul>
      continue;
    }
    const { node, tag } = it;
    if (tag === 'H3' || tag === 'H2') {
      card.title = node;
    } else if (tag === 'P') {
      const t = (node.textContent || '').trim();
      // A standalone price line ("US$34.99/mo") — NOT prose that merely mentions
      // a price (the long desc also contains "US$…/mo").
      if (/^[^\s]*US\$\s?[\d.,]+\s?\/\s?mo[^\s]*$/i.test(t)) card.prices.push(node);
      else if (/billed|annual/i.test(t)) card.billing = node;
      else if (!card.desc) card.desc = node;
    } else if (tag === 'UL' || tag === 'OL') {
      card.features.push({ head: pendingText, list: node });
      pendingText = '';
    } else if (tag === 'A') {
      const txt = (node.textContent || '').toLowerCase();
      const href = (node.getAttribute('href') || '').toLowerCase();
      if (/terms/.test(href) || /see terms/.test(txt)) card.seeTerms = node;
      else card.cta = node;
    }
  }
  return card;
}

function buildCard(data) {
  const featured = !!data.cta && /#_button-fill/.test(data.cta.getAttribute('href') || '');
  const variant = featured ? 'light' : 'dark';
  const cardEl = createTag('div', `plan-card ${variant}`);

  // Eyebrow: mnemonic + label.
  const eyebrow = createTag('div', 'plan-eyebrow');
  if (data.mnemonic) {
    const mn = createTag('span', 'plan-mnemonic');
    mn.appendChild(data.mnemonic);
    markImage(mn);
    eyebrow.appendChild(mn);
  }
  if (data.eyebrow) eyebrow.appendChild(document.createTextNode(data.eyebrow));
  cardEl.appendChild(eyebrow);

  if (data.title) { data.title.classList.add('t-plantitle'); cardEl.appendChild(data.title); }
  if (data.desc) { data.desc.classList.add('plan-desc'); cardEl.appendChild(data.desc); }
  if (data.seeTerms) {
    data.seeTerms.classList.add('plan-see');
    data.seeTerms.setAttribute('daa-ll', slug(data.seeTerms.textContent));
    cardEl.appendChild(data.seeTerms);
  }

  if (data.prices.length >= 2) {
    data.prices[0].classList.add('plan-price-old');
    cardEl.appendChild(data.prices[0]);
    data.prices[1].classList.add('t-price', 'plan-price');
    cardEl.appendChild(data.prices[1]);
  } else if (data.prices.length === 1) {
    data.prices[0].classList.add('t-price', 'plan-price');
    cardEl.appendChild(data.prices[0]);
  }
  if (data.billing) { data.billing.classList.add('plan-billing'); cardEl.appendChild(data.billing); }

  if (data.cta) {
    const fill = readButtonFill(data.cta);
    data.cta.classList.add('btn', 'plan-cta', fill ? 'btn-accent' : 'btn-outline-light');
    data.cta.setAttribute('daa-ll', slug(data.cta.textContent));
    cardEl.appendChild(data.cta);
  }

  if (data.secure) {
    const secure = createTag('div', 'plan-secure');
    secure.appendChild(iconSpan('lock'));
    secure.appendChild(document.createTextNode(data.secure));
    cardEl.appendChild(secure);
  }

  if (data.features.length) {
    const feats = createTag('div', 'plan-feats');
    for (const f of data.features) {
      const group = createTag('div', 'feat-group');
      const head = createTag('div', 'feat-head');
      head.appendChild(iconSpan(headIcon(f.head)));
      if (f.head) head.appendChild(document.createTextNode(f.head));
      group.appendChild(head);
      if (f.list) group.appendChild(f.list);
      feats.appendChild(group);
    }
    cardEl.appendChild(feats);
  }
  return cardEl;
}

export default async function init(el) {
  if (!el) return;
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

  const tokens = buildTokens(el);
  const firstMediaIdx = tokens.findIndex(isMedia);
  const titleTok = tokens.find((t) => t.kind === 'el' && t.tag === 'H2');
  const titleNode = titleTok ? titleTok.node : null;

  // Tabs: bare text lines between the title and the first card mnemonic.
  const titleIdx = titleTok ? tokens.indexOf(titleTok) : -1;
  const tabEnd = firstMediaIdx === -1 ? tokens.length : firstMediaIdx;
  const tabLabels = tokens
    .slice(titleIdx + 1, tabEnd)
    .filter((t) => t.kind === 'text')
    .map((t) => t.text);

  // Everything from the first mnemonic on is cards (+ a trailing footer link).
  const tail = firstMediaIdx === -1 ? [] : tokens.slice(firstMediaIdx);
  let footerLink = null;
  if (tail.length && tail[tail.length - 1].kind === 'el' && tail[tail.length - 1].tag === 'A') {
    footerLink = tail.pop().node;
  }
  const segments = [];
  let cur = null;
  for (const t of tail) {
    if (isMedia(t)) { cur = { media: t.node, items: [] }; segments.push(cur); }
    else if (cur) cur.items.push(t);
  }

  // RECONSTRUCT the rich layout (move nodes, never serialize — keeps
  // <source>/<img> attrs, loading="lazy", srcset, MEP intact).
  const innerWrap = createTag('div', 'section-inner');

  if (titleNode) { titleNode.classList.add('t-title2'); innerWrap.appendChild(titleNode); }

  if (tabLabels.length) {
    const tabs = createTag('div', 'plan-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Plan audience');
    tabLabels.forEach((label, i) => {
      const tab = createTag('button', `plan-tab${i === 0 ? ' is-active' : ''}`, label);
      tab.setAttribute('type', 'button');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      tab.setAttribute('daa-ll', slug(label));
      tabs.appendChild(tab);
    });
    innerWrap.appendChild(tabs);
  }

  if (segments.length) {
    const cards = createTag('div', 'plan-cards');
    for (const seg of segments) cards.appendChild(buildCard(parseCard(seg)));
    innerWrap.appendChild(cards);
  }

  if (footerLink) {
    footerLink.classList.add('btn', 'btn-outline-light', 'plans-allbtn');
    footerLink.setAttribute('daa-ll', slug(footerLink.textContent));
    innerWrap.appendChild(footerLink);
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
