const BLOCK = 'forge-richcontent';

function stampAnalytics(root) {
  root.querySelectorAll('a[href], button').forEach((node) => {
    if (node.hasAttribute('daa-ll')) return;
    const label = node.getAttribute('aria-label')
      || node.textContent.trim().slice(0, 50)
      || node.className.split(' ').find(Boolean)
      || 'link';
    node.setAttribute('daa-ll', label);
  });
  root.querySelectorAll('img:not([daa-im])').forEach((img) => {
    img.setAttribute('daa-im', img.getAttribute('alt') || 'image');
  });
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // Authored DA table rows (EDS wraps each row in `block > div`, each cell in `> div`)
  const rows = [...el.querySelectorAll(':scope > div')];

  // Row 0: background picture
  const bgPicture = rows[0]?.querySelector('picture');

  // Row 1, col 0: badge SVG images; col 1: eyebrow text
  const row1Cells = rows[1] ? [...rows[1].querySelectorAll(':scope > div')] : [];
  const badgeImgs = row1Cells[0] ? [...row1Cells[0].querySelectorAll('img')] : [];
  const eyebrowText = row1Cells[1]?.textContent?.trim() ?? '';

  // Row 2: headline — probe for authored heading or fall back to plain text
  const headlineSource = rows[2]?.querySelector('h1, h2, h3');
  const headlineText = headlineSource?.textContent?.trim()
    ?? rows[2]?.querySelector(':scope > div')?.textContent?.trim()
    ?? '';

  // Build: background image layer
  const bgDiv = document.createElement('div');
  bgDiv.className = 'rc-bg';
  bgDiv.setAttribute('aria-hidden', 'true');
  if (bgPicture) bgDiv.appendChild(bgPicture);

  // Build: gradient scrim overlay (CSS-driven)
  const scrim = document.createElement('div');
  scrim.className = 'rc-scrim';
  scrim.setAttribute('aria-hidden', 'true');

  // Build: top content container
  const rcTop = document.createElement('div');
  rcTop.className = 'rc-top';

  const eyebrowRow = document.createElement('div');
  eyebrowRow.className = 'eyebrow-row';

  if (badgeImgs.length) {
    const badge = document.createElement('span');
    badge.className = 'cc-badge';
    badge.setAttribute('aria-hidden', 'true');
    badgeImgs.forEach((img) => badge.appendChild(img));
    eyebrowRow.appendChild(badge);
  }

  if (eyebrowText) {
    const eyebrowSpan = document.createElement('span');
    eyebrowSpan.className = 'eyebrow';
    eyebrowSpan.textContent = eyebrowText;
    eyebrowRow.appendChild(eyebrowSpan);
  }

  rcTop.appendChild(eyebrowRow);

  // L8: at most one h1 per block — this block uses h2 for the section headline
  if (headlineText) {
    const headline = document.createElement('h2');
    headline.className = 'display-title-2 rc-headline';
    headline.textContent = headlineText;
    rcTop.appendChild(headline);
  }

  // Replace authored table rows with structured block DOM (preserves el attributes for MEP)
  el.replaceChildren(bgDiv, scrim, rcTop);

  stampAnalytics(el);
  el.dataset.forgeAuthored = BLOCK;
}
