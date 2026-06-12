/**
 * forge-hero — Milo C2 hero block authored by Forge for the Creative Cloud Pro
 * offer section (eyebrow + headline + body + CTA, a layered hero asset, and a
 * 2-up bento grid). No existing C2 catalog block bound to this section, so it
 * ships as a dedicated forge-* block.
 *
 * DA renders the authored block table as `el > div(row) > div(cell) > <hero markup>`.
 * The scoped stylesheet keys on the section's NATURAL structure (`.hero__copy`,
 * `.hero__asset`, `.hero__bentos`), so this decorator lifts the authored content
 * out of the EDS row/cell wrappers, then enhances it in place — never wiping or
 * re-serializing, so authored `<picture>`/`<img>` attributes and any MEP/Target
 * data-* attributes survive untouched.
 *
 * @param {HTMLElement} el  The block element Milo passes to every C2 decorator.
 * @returns {Promise<void>}
 */
const BLOCK = 'forge-hero';

// A real navigation target is a non-empty href that is not a bare "#" anchor.
function isRealHref(href) {
  return !!href && href !== '#' && !href.startsWith('#');
}

export default async function init(el) {
  if (!el) return;
  // Section-level analytics handle (idiomatic Milo).
  el.setAttribute('daa-lh', BLOCK);

  // Un-wrap the EDS row/cell so the scoped CSS keys on the lifted hero children.
  // Probe outward (querySelector) rather than children[N] — authors rearrange rows.
  const inner = el.querySelector(':scope > div > div');
  if (inner && inner.querySelector('.hero__copy, .hero__asset, .hero__bentos')) {
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  // The CTA is authored as <a href="#"> styled like a button. A "#" href is not a
  // real navigation target, so render a real <button> (keyboard/SR-correct) while
  // preserving the authored class and any MEP/personalization data-* attributes.
  const cta = el.querySelector('.hero__cta');
  if (cta) {
    let action = cta;
    if (cta.tagName === 'A' && !isRealHref(cta.getAttribute('href'))) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = cta.className;
      btn.textContent = cta.textContent.trim();
      [...cta.attributes].forEach(({ name, value }) => {
        if (name === 'href' || name === 'class') return;
        btn.setAttribute(name, value);
      });
      cta.replaceWith(btn);
      action = btn;
    }
    action.setAttribute('daa-ll', action.textContent.trim() || 'cta');
  }

  // Analytics handle on every image the section presents (additive — keeps
  // authored loading/width/height/srcset attributes intact).
  el.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('daa-im')) img.setAttribute('daa-im', 'true');
  });

  el.dataset.forgeAuthored = BLOCK;
}
