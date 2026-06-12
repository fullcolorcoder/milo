/**
 * forge-trust — Milo C2 block authored by Forge for the Creative Cloud Pro
 * offer "why choose" section: an eyebrow + section headline over a 3-up grid
 * of trust tiles (each an image, a sub-heading, and a paragraph of copy).
 *
 * DA renders the authored block table as `el > div(row) > div(cell) > <markup>`.
 * The scoped stylesheet keys on the section's NATURAL structure
 * (`.trust__head`, `.trust__tiles`, `.tile`), so this decorator lifts the
 * authored content out of the EDS row/cell wrappers, then enhances it in
 * place — never wiping or re-serializing, so authored `<picture>`/`<img>`
 * attributes and any MEP/Target data-* attributes survive untouched.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
const BLOCK = 'forge-trust';

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Un-wrap the EDS row/cell so the scoped CSS keys on the lifted children.
  // Probe outward (querySelector) rather than children[N] — authors rearrange rows.
  const inner = el.querySelector(':scope > div > div');
  if (inner && inner.querySelector('.trust__head, .trust__tiles')) {
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  // Analytics handle on every image the section presents (additive — keeps
  // authored loading/width/height/srcset attributes intact).
  el.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('daa-im')) img.setAttribute('daa-im', 'true');
  });

  el.dataset.forgeAuthored = BLOCK;
}
