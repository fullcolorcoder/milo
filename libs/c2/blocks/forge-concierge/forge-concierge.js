/**
 * forge-concierge — Milo C2 block authored by Forge for the Creative Cloud Pro
 * offer "AI concierge" section: a centered headline, a single-line AI prompt
 * input (icon + text field + send affordance), a row of suggestion chips, and a
 * legal disclaimer with inline links. No existing C2 catalog block bound to this
 * section, so it ships as a dedicated forge-* block.
 *
 * DA renders the authored block table as `el > div(row) > div(cell) > <markup>`.
 * The scoped stylesheet keys on the section's NATURAL structure
 * (`.concierge__wrap`, `.prompt-input`, `.suggestions`, `.chip`), so this
 * decorator lifts the authored content out of the EDS row/cell wrappers and then
 * enhances it in place — never wiping or re-serializing, so any MEP/Target
 * data-* attributes on the authored nodes survive untouched.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
const BLOCK = 'forge-concierge';

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Un-wrap the EDS row/cell so the scoped CSS keys on the lifted concierge
  // children. Probe outward (querySelector) rather than children[N] — authors
  // rearrange rows.
  const inner = el.querySelector(':scope > div > div');
  if (inner && inner.querySelector('.concierge__wrap, .prompt-input, .suggestions')) {
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  // The send affordance is authored as a non-interactive <span> wrapping an SVG.
  // Promote it to a real <button> so it is keyboard- and SR-reachable, preserving
  // its class, inner SVG, and any MEP/personalization data-* attributes.
  const send = el.querySelector('.prompt-input .send');
  if (send && send.tagName !== 'BUTTON') {
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = send.className;
    btn.setAttribute('aria-label', 'Send');
    [...send.attributes].forEach(({ name, value }) => {
      if (name === 'class') return;
      btn.setAttribute(name, value);
    });
    while (send.firstChild) btn.appendChild(send.firstChild);
    send.replaceWith(btn);
    btn.setAttribute('daa-ll', 'send');
  }

  // Tag each suggestion chip for analytics (they are already real <button>s).
  el.querySelectorAll('.suggestions .chip').forEach((chip, i) => {
    chip.setAttribute('daa-ll', `suggestion-${i + 1}`);
  });

  el.dataset.forgeAuthored = BLOCK;
}
