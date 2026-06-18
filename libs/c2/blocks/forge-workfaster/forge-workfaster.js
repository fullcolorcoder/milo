/**
 * forge-workfaster — a Milo C2 block for the "Work faster. No matter the work."
 * section: a centered headline above a single full-width composite "use-case
 * cards" image (Sales / Marketing / Legal / HR cards + a brand logo strip, all
 * baked into one picture by the author).
 *
 * DA strips authored classes and serializes the cell as a FLAT, class-less run of
 * semantic nodes in document order: <h2> then <picture>. So init() probes by
 * content shape (never by an authored class or a fixed child index), then
 * RECONSTRUCTS the rich layout — a `.head` wrapper around the heading and a
 * `.workfaster-cards` media wrapper around the picture — stamping its own
 * `.forge-workfaster`-scoped classes that the scoped CSS keys on.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
// CANONICAL DEPTH: from libs/c2/blocks/<name>/ to libs/utils/decorate.js is
// THREE hops up (blocks -> c2 -> libs). The 3-hop '../../../' is CORRECT.
import { decorateBlockText } from '../../../utils/decorate.js';

const BLOCK = 'forge-workfaster';

// MEP / personalization markers Milo stamps on the row/cell wrapper. The rebuild
// discards that wrapper, so copy any present marker up onto the block root FIRST
// so a later Target/MEP swap still finds them.
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

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // The authored content lives in the (possibly wrapper-nested) cell. Probe the
  // deepest cell so MEP markers can be lifted before the rebuild discards it.
  const inner = el.querySelector(':scope > div > div');
  if (inner) preserveMepAttrs(inner.parentElement, el);

  // PROBE by content shape, not by class or index. Headings + paragraphs are the
  // copy; pictures (or bare imgs) are the composite card media.
  const source = inner || el;
  const copyNodes = [...source.querySelectorAll('h1, h2, h3, h4, h5, h6, p')];
  const mediaNodes = [...source.querySelectorAll('picture')];
  // If a picture wraps a heading (it never should here), keep copy distinct.
  const mediaOnly = mediaNodes.filter((m) => !copyNodes.some((c) => m.contains(c)));

  // RECONSTRUCT: build the centered head, then the full-width cards media.
  const head = document.createElement('div');
  head.className = 'head';

  copyNodes.forEach((node) => {
    // Demote any stray <h1> to <h2> (≤1 h1 per block; this section has none).
    if (node.tagName === 'H1') {
      const h2 = document.createElement('h2');
      h2.innerHTML = node.innerHTML;
      node.replaceWith(h2);
      node = h2; // eslint-disable-line no-param-reassign
    }
    if (/^H[1-6]$/.test(node.tagName)) {
      node.classList.add('t-title2', 'title-2');
    } else {
      node.classList.add('t-bodymd', 'body-md');
    }
    head.appendChild(node);
  });

  const rebuilt = [];
  if (head.childElementCount) rebuilt.push(head);

  mediaOnly.forEach((pic) => {
    const wrap = document.createElement('div');
    wrap.className = 'workfaster-cards';
    const img = pic.querySelector('img');
    if (img) {
      img.setAttribute('daa-im', 'true');
      if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
    }
    wrap.appendChild(pic);
    rebuilt.push(wrap);
  });

  // Guard: never emit an empty section. If probing found nothing, leave the
  // authored DOM untouched rather than wiping it.
  if (rebuilt.length) {
    el.replaceChildren(...rebuilt);
  }

  // Promote text to C2 typography via Milo's own service (additive to our classes).
  try {
    if (typeof decorateBlockText === 'function' && head.childElementCount) {
      decorateBlockText(head);
    }
  } catch (e) {
    // decorateBlockText is best-effort; our explicit classes already style copy.
  }

  el.dataset.forgeAuthored = BLOCK;
}
