/**
 * forge-plans — Milo C2 block for the "Plans that work for you." pricing
 * section. This section matched no existing C2 block, so it is authored fresh.
 *
 * DA serializes the authored block as a FLAT, class-less run of semantic nodes
 * (h2 title, loose tab/eyebrow/secure text, h3 plan names, p copy/price, a CTAs,
 * h4 + p feature groups, a trailing "Compare plans" link) in document order —
 * with NO grid/column/card wrappers and NONE of the Figma structural classes.
 * So init() PROBES the flat content by shape (never by an authored class or a
 * fixed index), then RECONSTRUCTS the rich plan grid with createElement +
 * classList.add (its own .forge-plans-scoped classes), which the scoped CSS
 * styles. It never wipes el.innerHTML; it builds a fresh tree and calls
 * el.replaceChildren once.
 *
 * @param {HTMLElement} el The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: libs/c2/blocks/<name>/ -> libs/utils/ is THREE hops up
// (blocks -> c2 -> libs). Keep the 3-hop specifier; a wrong path 404s on load.
import { decorateButtons } from '../../../utils/decorate.js';

const BLOCK = 'forge-plans';

// MEP / personalization markers Milo stamps on the row/cell wrapper. The rebuild
// discards that wrapper, so copy any present marker up onto the block root first.
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

function tag(name, attrs = {}, kids = []) {
  const node = document.createElement(name);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v == null) return;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  (Array.isArray(kids) ? kids : [kids]).forEach((c) => c && node.append(c));
  return node;
}

// Inline brand/utility glyphs (SVG) the flat content lost. Built on throwaway
// wrappers — el.innerHTML is never touched.
function svg(markup) {
  const span = document.createElement('span');
  span.innerHTML = markup;
  return span.firstElementChild;
}
const ACRO = '<svg class="acro-ico" viewBox="0 0 22 22" aria-hidden="true"><rect width="22" height="22" rx="5" fill="#eb1000"></rect><text x="11" y="15.5" font-family="Adobe Clean, sans-serif" font-size="11" font-weight="900" fill="#fff" text-anchor="middle">A</text></svg>';
const LOCK = '<svg class="lock-ico" viewBox="0 0 14 16" aria-hidden="true"><rect x="2" y="6.5" width="10" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"></rect><path d="M4.3 6.5V4.6a2.7 2.7 0 0 1 5.4 0v1.9" fill="none" stroke="currentColor" stroke-width="1.3"></path></svg>';
const FEAT = '<svg class="feat-ico" viewBox="0 0 18 18" aria-hidden="true"><path d="M3.5 9.5l3 3 8-8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

// Walk the flat cell, emitting tokens in document order: every h2-h6/p/a element
// plus every standalone text run (tab/eyebrow/secure labels live in bare divs).
function collectTokens(root) {
  const out = [];
  for (const node of root.childNodes) {
    if (node.nodeType === 3) {
      const t = node.textContent.replace(/\s+/g, ' ').trim();
      if (t) out.push({ type: 'text', text: t });
    } else if (node.nodeType === 1) {
      const tn = node.tagName;
      if (/^(H[2-6]|P|A)$/.test(tn)) out.push({ type: tn.toLowerCase(), node });
      else out.push(...collectTokens(node));
    }
  }
  return out;
}

function buildEyebrow(label) {
  return tag('div', { class: 'plan-eyebrow' }, [
    svg(ACRO),
    tag('span', { class: 't-label', text: label }),
  ]);
}

function buildCta(aNode, idx) {
  const href = aNode.getAttribute('href') || '#';
  const fill = /#_button-fill/.test(href);
  const a = tag('a', {
    class: `btn ${fill ? 'btn-blue' : 'btn-outline'}`,
    href: href.replace('#_button-fill', '#') || '#',
    text: aNode.textContent.trim(),
  });
  a.setAttribute('daa-ll', `cta-${idx}`);
  preserveMepAttrs(aNode, a);
  return a;
}

// Parse one card's token run into its rebuilt .plan-col.
function buildCard(tokens, featured) {
  const col = tag('div', { class: `plan-col${featured ? ' featured' : ''}` });
  const card = tag('div', { class: 'plan-card' });
  const features = tag('div', { class: 'plan-features' });

  let i = 0;
  // Eyebrow (leading loose text) + plan name (h3).
  if (tokens[i]?.type === 'text') { card.append(buildEyebrow(tokens[i].text)); i += 1; }
  if (tokens[i]?.type === 'h3') {
    card.append(tag('h3', { class: 't-planname', text: tokens[i].node.textContent.trim() }));
    i += 1;
  }

  // Pre-feature run: desc/price/sub paragraphs, CTAs, secure note — until 1st h4.
  const paras = [];
  const ctas = [];
  let secure = null;
  while (i < tokens.length && tokens[i].type !== 'h4') {
    const t = tokens[i];
    if (t.type === 'p') paras.push(t.node.textContent.trim());
    else if (t.type === 'a') ctas.push(t.node);
    else if (t.type === 'text') secure = t.text;
    i += 1;
  }
  if (paras[0]) card.append(tag('p', { class: 't-bodymd plan-desc', text: paras[0] }));
  const priceWrap = tag('div', { class: 'plan-price-wrap' });
  if (paras[1]) priceWrap.append(tag('p', { class: 't-price', text: paras[1] }));
  if (paras[2]) priceWrap.append(tag('p', { class: 't-bodysm plan-price-sub', text: paras[2] }));
  if (priceWrap.childElementCount) card.append(priceWrap);
  if (ctas.length) {
    const ctaWrap = tag('div', { class: 'plan-ctas' });
    ctas.forEach((c, n) => ctaWrap.append(buildCta(c, n + 1)));
    card.append(ctaWrap);
  }
  if (secure) {
    card.append(tag('div', { class: 'secure' }, [
      svg(LOCK), tag('span', { class: 't-bodysm', text: secure }),
    ]));
  }

  // Feature groups: each h4 starts a group, following p's belong to it.
  for (; i < tokens.length; i += 1) {
    const t = tokens[i];
    if (t.type === 'h4') {
      features.append(tag('h4', { class: 't-h6' }, [
        svg(FEAT), document.createTextNode(t.node.textContent.trim()),
      ]));
    } else if (t.type === 'p') {
      features.append(tag('p', { class: 't-bodymd feat', text: t.node.textContent.trim() }));
    }
  }

  col.append(card);
  if (features.childElementCount) col.append(features);
  return col;
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const cell = el.querySelector(':scope > div > div') || el;
  preserveMepAttrs(cell?.parentElement, el);

  const tokens = collectTokens(cell);
  if (!tokens.length) return;

  // Pull the standalone trailing link aside as the "Compare plans" CTA.
  let compare = null;
  if (tokens[tokens.length - 1]?.type === 'a') compare = tokens.pop().node;

  const title = tokens.find((t) => t.type === 'h2');
  const h3Idx = tokens.map((t, n) => (t.type === 'h3' ? n : -1)).filter((n) => n >= 0);

  // Tabs = loose text after the title and before the first card's eyebrow
  // (the eyebrow is the loose text immediately preceding the first h3).
  const firstEyebrow = h3Idx.length && tokens[h3Idx[0] - 1]?.type === 'text'
    ? h3Idx[0] - 1 : h3Idx[0];
  const titleIdx = tokens.indexOf(title);
  const tabLabels = tokens
    .slice(titleIdx + 1, firstEyebrow)
    .filter((t) => t.type === 'text')
    .map((t) => t.text);

  // Build the rebuilt section.
  const inner = tag('div', { class: 'section-inner' });
  if (title) {
    inner.append(tag('div', { class: 'head' }, [
      tag('h2', { class: 't-title2 title-2', text: title.node.textContent.trim() }),
    ]));
  }
  if (tabLabels.length) {
    const tabs = tag('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Plan audience' });
    tabLabels.forEach((label, n) => {
      const btn = tag('button', {
        class: 'tab', type: 'button', role: 'tab', text: label,
        'aria-selected': n === 0 ? 'true' : 'false',
      });
      btn.setAttribute('daa-ll', `tab-${n + 1}`);
      btn.addEventListener('click', () => {
        tabs.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', 'false'));
        btn.setAttribute('aria-selected', 'true');
      });
      tabs.append(btn);
    });
    inner.append(tabs);
  }

  // One .plan-col per h3 (= per card); last card is the featured tier.
  const grid = tag('div', { class: 'plan-grid', role: 'tabpanel' });
  h3Idx.forEach((start, k) => {
    const segStart = tokens[start - 1]?.type === 'text' ? start - 1 : start;
    const next = h3Idx[k + 1];
    const segEnd = next != null
      ? (tokens[next - 1]?.type === 'text' ? next - 1 : next)
      : tokens.length;
    grid.append(buildCard(tokens.slice(segStart, segEnd), k === h3Idx.length - 1));
  });
  if (grid.childElementCount) inner.append(grid);

  if (compare) {
    const a = buildCta(compare, 'compare');
    a.className = 'btn btn-outline';
    a.setAttribute('daa-ll', 'compare-plans');
    inner.append(tag('div', { class: 'compare-wrap' }, [a]));
  }

  el.replaceChildren(inner);

  // Idiomatic Milo button decoration (safe no-op for plain anchors).
  try { decorateButtons(el); } catch (e) { /* non-fatal */ }

  el.dataset.forgeAuthored = BLOCK;
}
