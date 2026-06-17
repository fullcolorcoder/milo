/**
 * forge-concierge — a Milo C2 block authored by Forge from the Figma "concierge"
 * section ("Find what you're looking for." — a dark, centered AI-prompt lockup:
 * a display title, a pill-shaped prompt input with an AI sparkle icon and a send
 * icon, four suggestion chips in a 2-up grid, and a legal disclaimer with links).
 *
 * DA strips authored classes and serializes the block as a FLAT, class-less run
 * of <h2>/<p>/<picture>/<a> in document order — there is NO .prompt/.p-input/
 * .chips wrapper at runtime. So init() PROBES the flat content by shape (never by
 * an authored class or positional index) and RECONSTRUCTS the rich lockup with
 * createElement + classList.add, stamping its own .forge-concierge-scoped hooks
 * that the co-located forge-concierge.css keys on. Nodes (especially <picture>)
 * are MOVED, not cloned, so loading/srcset/sizes/width/height survive intact.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). The 3-hop '../../../' form is CORRECT.
import { decorateBlockText, decorateViewportContent } from '../../../utils/decorate.js';

const BLOCK = 'forge-concierge';

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

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo; daa-ll stays section-owned).
  el.setAttribute('daa-lh', BLOCK);

  // Probe by content shape in DOCUMENT ORDER, regardless of how many EDS row/cell
  // <div>s wrap the content. Never key on authored classes (DA strips them).
  const title = el.querySelector('h1, h2, h3, h4');
  const paras = [...el.querySelectorAll('p')];
  // Legal disclaimer = the paragraph that carries the policy links (fallback: the
  // longest text paragraph).
  const legal = paras.find((p) => p.querySelector('a'))
    || paras.slice().sort((a, b) => b.textContent.length - a.textContent.length)[0]
    || null;

  // The input row's media: an AI sparkle icon (left) + a send icon (right).
  const pics = [...el.querySelectorAll('picture')];
  const sendPic = pics.find((p) => p.querySelector('img')?.getAttribute('alt') === 'Send')
    || pics[1] || null;
  const aiPic = pics.find((p) => p !== sendPic) || null;

  // Placeholder text lives in the same host as the input media (e.g. "Ask anything").
  const inputHost = aiPic
    ? (aiPic.closest('p') || aiPic.parentElement)
    : (sendPic ? (sendPic.closest('p') || sendPic.parentElement) : null);
  const placeholder = clean(inputHost?.textContent) || 'Ask anything';

  // Suggestion chips = text-only paragraphs that are neither the legal copy nor
  // the input host.
  const chipEls = paras.filter((p) => p !== legal
    && !p.querySelector('picture')
    && !p.querySelector('a')
    && clean(p.textContent));

  // Nothing recognizable to rebuild — leave the authored DOM untouched.
  if (!title && chipEls.length === 0 && pics.length === 0) {
    el.dataset.forgeAuthored = BLOCK;
    return;
  }

  // RECONSTRUCT: section-inner.inner > [title, .prompt > (.p-input, .chips), legal].
  const inner = createTag('div', 'section-inner inner');

  if (title) {
    title.classList.add('cc-title', 'title-2');
    inner.appendChild(title);
  }

  const prompt = createTag('div', 'prompt');

  const pInput = createTag('div', 'p-input');
  if (aiPic) {
    const ai = createTag('span', 'ai');
    aiPic.querySelector('img')?.setAttribute('daa-im', 'true');
    ai.appendChild(aiPic);
    pInput.appendChild(ai);
  }
  const ph = createTag('span', 'ph body-md');
  ph.textContent = placeholder;
  pInput.appendChild(ph);
  if (sendPic) {
    const send = createTag('button', 'send');
    send.type = 'button';
    send.setAttribute('aria-label', clean(sendPic.querySelector('img')?.getAttribute('alt')) || 'Send');
    send.setAttribute('daa-ll', 'send');
    sendPic.querySelector('img')?.setAttribute('daa-im', 'true');
    send.appendChild(sendPic);
    pInput.appendChild(send);
  }
  prompt.appendChild(pInput);

  if (chipEls.length) {
    const chips = createTag('div', 'chips');
    chipEls.forEach((p, i) => {
      const chip = createTag('button', 'chip body-sm');
      chip.type = 'button';
      chip.textContent = clean(p.textContent);
      chip.setAttribute('daa-ll', `chip-${i + 1}`);
      chips.appendChild(chip);
    });
    prompt.appendChild(chips);
  }
  inner.appendChild(prompt);

  if (legal) {
    legal.classList.add('legal', 'body-xs');
    legal.querySelectorAll('a').forEach((a) => {
      a.classList.add('u');
      a.setAttribute('daa-ll', clean(a.textContent).slice(0, 40) || 'link');
    });
    inner.appendChild(legal);
  }

  // Preserve MEP markers from the cell wrapper onto the root before we swap.
  const wrapper = el.querySelector(':scope > div > div') || el.querySelector(':scope > div');
  preserveMepAttrs(wrapper, el);

  // Single swap — no innerHTML wipe; authored nodes are MOVED into the new tree.
  el.replaceChildren(inner);

  // Run Milo's own text decorator to wire analytics + a11y onto the rebuilt copy
  // (headings → title-N, body → body-*). Guarded so a thrown internal never
  // bricks decorate; the scoped CSS does not depend on its output.
  const decorate = (scope) => {
    try { decorateBlockText(scope); } catch (e) { /* non-fatal */ }
  };
  try {
    if (typeof decorateViewportContent === 'function') decorateViewportContent(el, decorate);
    else decorate(el);
  } catch (e) { /* non-fatal */ }

  el.dataset.forgeAuthored = BLOCK;
}
