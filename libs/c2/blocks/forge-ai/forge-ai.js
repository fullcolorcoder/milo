/**
 * forge-ai — "The smartest Photoshop ever." A Milo C2 section block authored by
 * Forge for a Figma section that matched no existing catalog block (distinctive).
 *
 * THE DA TRAP (checklist C24): DA serialises this block's content as a FLAT,
 * class-LESS run of <p>/<h2>/<picture>/<h3>/<p>/<ul>/<picture> in document order.
 * The rich Figma layout (a dark image panel with an overlaid accordion + prompt
 * caption, followed by a dark "more than an app" numbered-list panel with a
 * floating card) does NOT exist in the DOM at runtime. So init(el) PROBES the
 * flat content by shape/order (never by an authored class) and RECONSTRUCTS the
 * structure with createElement + appendChild, stamping its OWN .forge-ai-scoped
 * classes that the co-authored scoped CSS keys on. Content nodes are MOVED (not
 * serialised) so <picture>/<img> attributes + MEP markers survive.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: libs/c2/blocks/<name>/ -> libs/utils/ is THREE hops up
// (blocks -> c2 -> libs). Do NOT 'correct' to 2 hops.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-ai';

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

function createTag(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

// The image-panel caption ("Dramatic soft orange lighting…") arrives as a bare
// text node, so it never appears in querySelectorAll — recover it by walking text.
function findPromptText(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let n = walker.nextNode();
  while (n) {
    const t = n.textContent.trim();
    if (t && /orange lighting|dramatic soft/i.test(t)) return t;
    n = walker.nextNode();
  }
  return '';
}

function runMiloText(scope) {
  if (!scope || typeof decorateBlockText !== 'function') return;
  try { decorateBlockText(scope); } catch (e) { /* additive only; CSS drives layout */ }
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const inner = el.querySelector(':scope > div > div');
  preserveMepAttrs(inner?.parentElement, el);

  // PROBE the flat content by shape + document order (never positional/class).
  const order = [...el.querySelectorAll('h2, h3, p, ul, picture')];
  const h2s = order.filter((n) => n.tagName === 'H2');
  const pics = order.filter((n) => n.tagName === 'PICTURE');
  if (h2s.length === 0) return; // nothing to reconstruct — leave authored DOM intact

  const title = h2s[0];
  const moreTitle = h2s[1] || null;
  const heroPic = pics[0] || null;
  const cardPic = pics.length > 1 ? pics[pics.length - 1] : null;
  const list = order.find((n) => n.tagName === 'UL') || null;
  const promptText = findPromptText(el);

  const ti = order.indexOf(title);
  const eyebrow = ti > 0 && order[ti - 1].tagName === 'P' ? order[ti - 1] : null;
  const sub = order[ti + 1] && order[ti + 1].tagName === 'P' ? order[ti + 1] : null;

  // Accordion: h3 + following p pairs between the hero picture and the 2nd h2.
  const accStart = heroPic ? order.indexOf(heroPic) + 1 : ti + 2;
  const accEnd = moreTitle ? order.indexOf(moreTitle) : order.length;
  const pairs = [];
  for (let i = accStart; i < accEnd; i += 1) {
    if (order[i].tagName === 'H3') {
      const body = order[i + 1] && order[i + 1].tagName === 'P' ? order[i + 1] : null;
      pairs.push([order[i], body]);
    }
  }

  // ---- Reconstruct: smart panel --------------------------------------------
  const head = createTag('div', 'ai-head');
  if (eyebrow) { eyebrow.classList.add('ai-eyebrow', 'eyebrow'); head.append(eyebrow); }
  title.classList.add('ai-title', 'title-2');
  head.append(title);
  if (sub) { sub.classList.add('ai-sub', 'body-md'); head.append(sub); }

  const accordion = createTag('div', 'ai-accordion', { role: 'list' });
  pairs.forEach(([h3, body], i) => {
    const item = createTag('div', `ai-acc-item${i === 0 ? ' is-open' : ''}`, { role: 'listitem' });
    const btn = createTag('button', 'ai-acc-trigger', {
      type: 'button',
      'aria-expanded': i === 0 ? 'true' : 'false',
      'daa-ll': `accordion-${i + 1}`,
    });
    const ico = createTag('span', 'ai-acc-ico');
    ico.setAttribute('aria-hidden', 'true');
    while (h3.firstChild) btn.appendChild(h3.firstChild);
    btn.prepend(ico);
    h3.classList.add('ai-acc-title');
    h3.appendChild(btn);
    item.append(h3);
    if (body) {
      const bodyId = `ai-acc-body-${i + 1}`;
      body.classList.add('ai-acc-body', 'body-sm');
      body.id = bodyId;
      btn.setAttribute('aria-controls', bodyId);
      item.append(body);
    }
    btn.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    accordion.append(item);
  });

  const panel = createTag('div', 'ai-panel');
  if (heroPic) panel.append(heroPic);
  if (pairs.length) panel.append(accordion);
  if (promptText) {
    const cap = createTag('span', 'ai-prompt');
    cap.textContent = promptText;
    panel.append(cap);
  }

  const smart = createTag('div', 'ai-smart');
  smart.append(head, panel);

  // ---- Reconstruct: "more than an app" panel -------------------------------
  let more = null;
  let moreInner = null;
  if (moreTitle) {
    more = createTag('div', 'ai-more');
    moreInner = createTag('div', 'section-inner');
    moreTitle.classList.add('ai-more-title', 'title-2');
    const right = createTag('div', 'ai-more-right');
    if (list) {
      list.classList.add('ai-more-list');
      [...list.querySelectorAll(':scope > li')].forEach((li) => {
        if (li.querySelector('.txt')) return;
        const span = createTag('span', 'txt');
        while (li.firstChild) span.appendChild(li.firstChild);
        li.appendChild(span);
      });
      right.append(list);
    }
    if (cardPic) {
      const float = createTag('span', 'ai-card-float');
      float.append(cardPic);
      right.append(float);
    }
    moreInner.append(moreTitle, right);
    more.append(moreInner);
  }

  // Image analytics — images are MOVED, so attrs/loading are already preserved.
  [heroPic, cardPic].forEach((pic) => {
    const img = pic?.querySelector('img');
    if (img) img.setAttribute('daa-im', 'true');
  });

  const root = createTag('div', 'forge-ai-inner');
  root.append(smart);
  if (more) root.append(more);

  // Single swap (never innerHTML wipe) — discards the now-empty DA wrappers.
  el.replaceChildren(root);

  // Promote text to Milo C2 typography via the platform service (additive; our
  // own classes already drive the scoped CSS so this only enriches semantics).
  const decorate = () => { runMiloText(head); runMiloText(moreInner); };
  try {
    if (typeof decorateViewportContent === 'function') decorateViewportContent(el, decorate);
    else decorate();
  } catch (e) { decorate(); }

  el.dataset.forgeAuthored = BLOCK;
}
