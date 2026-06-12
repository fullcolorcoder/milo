/**
 * forge-faq — Milo C2 block authored by Forge for the Creative Cloud Pro
 * offer FAQ section: a centered section headline over a stack of native
 * <details> accordion items (question summary + plus/minus icon + answer copy).
 *
 * DA renders the authored block table as `el > div(row) > div(cell) > <markup>`.
 * The scoped stylesheet keys on the section's NATURAL structure
 * (`.faq__head`, `.acc`, `.acc__item`), so this decorator lifts the authored
 * content out of the EDS row/cell wrappers, then enhances it in place — never
 * wiping or re-serializing, so authored MEP/Target data-* attributes survive.
 *
 * The accordion behaviour is pure native <details>/<summary> + CSS, so no
 * motion or scroll wiring is emitted here (forge-adjustments owns animation).
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
const BLOCK = 'forge-faq';

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Un-wrap the EDS row/cell so the scoped CSS keys on the lifted children.
  // Probe outward (querySelector) rather than children[N] — authors rearrange rows.
  const inner = el.querySelector(':scope > div > div');
  if (inner && inner.querySelector('.faq__head, .acc')) {
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  // Per-question analytics: tag each accordion summary with a short label.
  el.querySelectorAll('.acc__item').forEach((item) => {
    const summary = item.querySelector('.acc__row');
    if (summary && !summary.hasAttribute('daa-ll')) {
      const q = item.querySelector('.acc__q')?.textContent?.trim() || 'faq';
      summary.setAttribute('daa-ll', q.slice(0, 40));
    }
  });

  el.dataset.forgeAuthored = BLOCK;
}
