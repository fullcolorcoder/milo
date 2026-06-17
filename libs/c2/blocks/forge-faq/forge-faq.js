/**
 * forge-faq — a Milo C2 block authored by Forge from a Figma section that
 * matched no existing catalog block: a full-width, dark, rounded-top FAQ
 * accordion ("Frequently asked questions").
 *
 * THE RUNTIME SHAPE (author-content.html): DA serializes this block's content as
 * a FLAT, class-less run of semantic nodes in document order — the section <h2>,
 * then a run of <p> where each QUESTION ends with "?" and each (optional) ANSWER
 * is a following <p> that does NOT end with "?". The authored .faq/.faq-item/
 * .faq-q/.faq-a classes are STRIPPED before init() runs, so this decorator
 * PROBES by content shape (trailing "?", never by authored class, never
 * positionally on el.children) and RECONSTRUCTS the accordion: a heading plus a
 * list of expandable question/answer rows (first row open). The scoped
 * forge-faq.css keys ONLY on the classes stamped here.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). Keep the 3-hop '../../../' specifier.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-faq';
const SVG_NS = 'http://www.w3.org/2000/svg';

// MEP / personalization markers Milo stamps on the row/cell wrapper. The rebuild
// discards those wrappers, so copy any present marker up onto the destination
// node FIRST — a node swap that drops them silently disables Target/MEP.
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

// A short, readable analytics label derived from the question text.
function shortLabel(text, index) {
  const slug = (text || '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .split('-').slice(0, 4).join('-');
  return slug ? `q-${index + 1}-${slug}`.slice(0, 40) : `q-${index + 1}`;
}

// Build the chevron icon without innerHTML (C3) so we never wipe authored DOM.
function buildChevron() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'chev');
  svg.setAttribute('viewBox', '0 0 12 12');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M2 4.5 6 8.5 10 4.5');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.4');
  path.setAttribute('fill', 'none');
  svg.appendChild(path);
  return svg;
}

// Classify a paragraph: a QUESTION ends with "?" (probe by content shape, never
// by an authored class). Everything else following a question is its answer.
function isQuestion(node) {
  return /\?\s*$/.test((node.textContent || '').trim());
}

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Lift MEP markers off the EDS row/cell wrappers before we rebuild.
  const inner = el.querySelector(':scope > div > div');
  if (inner) {
    preserveMepAttrs(inner.parentElement, el);
    preserveMepAttrs(inner, el);
  }

  // PROBE by content shape (C2): collect the flat semantic flow in document
  // order, regardless of how deep the EDS wrappers nest it.
  const flow = [...el.querySelectorAll('h1, h2, h3, p')];
  if (!flow.length) {
    el.dataset.forgeAuthored = BLOCK;
    return;
  }

  // The heading is the first H* (demote any stray H1 to H2 — at most one h1, L8).
  const heading = flow.find((n) => /^H[1-3]$/.test(n.tagName)) || null;
  const paras = flow.filter((n) => n.tagName === 'P');

  // CLUSTER the flat paragraphs into { question, answer } pairs: a "?" line
  // starts a new item; a non-"?" line is the answer to the current item.
  const items = [];
  let cur = null;
  for (const p of paras) {
    if (isQuestion(p) || !cur) {
      cur = { question: p, answers: [] };
      items.push(cur);
    } else {
      cur.answers.push(p);
    }
  }

  // RECONSTRUCT the section.
  const sectionInner = document.createElement('div');
  sectionInner.className = 'section-inner';

  if (heading) {
    heading.classList.add('t-title2', 'title-2', 'faq-title');
    sectionInner.appendChild(heading);
  }

  const list = document.createElement('div');
  list.className = 'faq-list';
  sectionInner.appendChild(list);

  items.forEach((it, i) => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    const open = i === 0;
    if (open) item.classList.add('is-open');
    preserveMepAttrs(it.question, item);

    const answerId = `forge-faq-a-${i + 1}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'faq-q t-faqq';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('daa-ll', shortLabel(it.question.textContent, i));

    const qText = document.createElement('span');
    qText.className = 'faq-q-text';
    while (it.question.firstChild) qText.appendChild(it.question.firstChild);
    btn.appendChild(qText);
    btn.appendChild(buildChevron());

    const answer = document.createElement('div');
    answer.className = 'faq-a';
    answer.id = answerId;
    answer.setAttribute('role', 'region');
    if (it.answers.length) {
      for (const a of it.answers) {
        while (a.firstChild) answer.appendChild(a.firstChild);
      }
      btn.setAttribute('aria-controls', answerId);
    }

    item.appendChild(btn);
    item.appendChild(answer);
    list.appendChild(item);

    btn.addEventListener('click', () => {
      const nowOpen = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
    });
  });

  // Single swap once the rebuilt tree is ready (C3 — no innerHTML wipe).
  el.replaceChildren(sectionInner);

  // Promote text to C2 typography + decorate links/hash-modifiers via Milo's own
  // services (additive — keeps the classes the scoped CSS keys on), wrapped in
  // decorateViewportContent for consistent SSR/CSR behaviour.
  const runDecorate = () => {
    try {
      list.querySelectorAll('.faq-a').forEach((a) => decorateBlockText(a));
    } catch (e) { /* typography promotion is best-effort, never fatal */ }
  };
  if (typeof decorateViewportContent === 'function') {
    decorateViewportContent(el, runDecorate);
  } else {
    runDecorate();
  }

  el.dataset.forgeAuthored = BLOCK;
}
