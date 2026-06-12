/**
 * forge-merch — a Milo C2 block authored by Forge for the Creative Cloud Pro
 * offer section (a centered copy column with eyebrow + headline + price + CTAs,
 * a full-width merch image, and a framed customer quote with decorative corner
 * marks). No existing C2 catalog block bound to this section, so it ships as a
 * dedicated forge-* block.
 *
 * DA renders the authored block table as `el > div(row) > div(cell) > <markup>`.
 * The scoped stylesheet keys on the section's NATURAL structure (`.merch__copy`,
 * `.merch__img`, `.merch__quote`), so this decorator lifts the authored content
 * out of the EDS row/cell wrappers, then enhances it in place — never wiping or
 * re-serializing, so authored `<picture>`/`<img>` attributes and any MEP/Target
 * data-* attributes survive untouched.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
const BLOCK = 'forge-merch';

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Un-wrap the EDS row/cell so the scoped CSS keys on the lifted children.
  // Probe outward (querySelector) rather than children[N] — authors rearrange rows.
  const inner = el.querySelector(':scope > div > div');
  if (inner && inner.querySelector('.merch__copy, .merch__img, .merch__quote')) {
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  // The two CTAs carry real navigation targets, so they stay <a>; just tag each
  // for analytics with a short label (preserves authored href + MEP data-*).
  el.querySelectorAll('.merch__btns a').forEach((link) => {
    link.setAttribute('daa-ll', link.textContent.trim() || 'cta');
  });

  // Analytics handle on every image the section presents (additive — keeps
  // authored loading/width/height/srcset attributes intact).
  el.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('daa-im')) img.setAttribute('daa-im', 'true');
  });

  el.dataset.forgeAuthored = BLOCK;
}
