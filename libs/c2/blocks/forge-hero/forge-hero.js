const BLOCK = 'forge-hero';

// Creates the SVG download/arrow icon used in the promo CTA.
function createPromoArrow() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('viewBox', '0 0 14 14');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M7 2v10M7 12l4-4M7 12L3 8');
  path.setAttribute('stroke', '#fff');
  path.setAttribute('stroke-width', '1.4');
  svg.appendChild(path);
  return svg;
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // EDS renders each DA table row as: block > div(row) > div(cell) > content
  const rows = [...el.querySelectorAll(':scope > div')];
  const frag = document.createDocumentFragment();

  // Row 0 → .copy: eyebrow, h1, lead paragraph, free-trial CTA
  const copyCell = rows[0]?.querySelector(':scope > div');
  if (copyCell) {
    const copy = document.createElement('div');
    copy.className = 'copy';

    const head = document.createElement('div');
    head.className = 'head';

    // Probe outward: eyebrow element (has .appid or .t-eyebrow)
    const eyebrow = copyCell.querySelector('.appid, .t-eyebrow');
    if (eyebrow) head.appendChild(eyebrow);

    // Heading — must be the sole h1 in this block (L8)
    const h1 = copyCell.querySelector('h1');
    if (h1) head.appendChild(h1);

    // Lead body paragraph
    const lead = copyCell.querySelector('.lead, p');
    if (lead) {
      lead.classList.add('lead');
      head.appendChild(lead);
    }

    copy.appendChild(head);

    // Free-trial CTA link with analytics
    const cta = copyCell.querySelector('a');
    if (cta) {
      cta.classList.add('free-trial', 't-label');
      cta.setAttribute('daa-ll', 'free-trial');
      copy.appendChild(cta);
    }

    frag.appendChild(copy);
  }

  // Row 1 → .asset: hero picture
  const assetCell = rows[1]?.querySelector(':scope > div');
  if (assetCell) {
    const asset = document.createElement('div');
    asset.className = 'asset';
    // Preserve the <picture> element with all its <source> and <img> attributes intact
    const picture = assetCell.querySelector('picture');
    if (picture) asset.appendChild(picture);
    frag.appendChild(asset);
  }

  // Row 2 → .promo: floating CTA widget (hidden on mobile via CSS)
  const promoCell = rows[2]?.querySelector(':scope > div');
  if (promoCell) {
    const promo = document.createElement('div');
    promo.className = 'promo';

    const lw = document.createElement('div');
    lw.className = 'lw';
    const promoIcon = promoCell.querySelector('img');
    if (promoIcon) lw.appendChild(promoIcon);
    const lbl = promoCell.querySelector('.lbl, span, p');
    if (lbl) {
      lbl.classList.add('lbl', 't-eyebrow');
      lw.appendChild(lbl);
    }
    promo.appendChild(lw);

    const rw = document.createElement('div');
    rw.className = 'rw';
    const ibtn = document.createElement('span');
    ibtn.className = 'ibtn';
    ibtn.setAttribute('aria-hidden', 'true');
    ibtn.appendChild(createPromoArrow());
    rw.appendChild(ibtn);
    promo.appendChild(rw);

    frag.appendChild(promo);
  }

  el.replaceChildren(frag);
  el.dataset.forgeAuthored = BLOCK;
}
