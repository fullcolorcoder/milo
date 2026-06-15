/**
 * forge-cap — a Milo C2 capabilities block: a 4-up grid of image+caption tiles
 * followed by an app-store badges row with a free-to-start meta line.
 *
 * IMPORTANT (DA class-stripping): at runtime `init(el)` receives the DA-authored
 * serialization, which is a FLAT run of class-less wrappers carrying only media
 * + text in document order — the authored `.cap__grid` / `.cap__item` / `.badges`
 * classes the scoped CSS keys on DO NOT exist yet. So this decorator RECONSTRUCTS
 * the visual structure from content order: it walks the flat children, separates
 * capability images from store-badge images, pairs each capability image with its
 * following caption into a `.cap__item`, wraps the tiles in `.cap__grid`, rebuilds
 * the `.badges` row, and stamps the part classes itself. Authored <picture>/<img>
 * nodes are MOVED (not recreated), so loading/srcset/sizes/width/height survive.
 */

const BLOCK = 'forge-cap';

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

function createTag(tag, attrs) {
  const node = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// A store badge is an svg/icon mnemonic or carries app-store alt text; everything
// else is a capability tile image.
function isBadgeImg(img) {
  const alt = (img.getAttribute('alt') || '').toLowerCase();
  const src = (img.getAttribute('src') || '').toLowerCase();
  return /app store|google play/.test(alt) || src.includes('/icons/') || src.endsWith('.svg');
}

// The meta line is the leftover text paragraph (no image) that reads as a
// free-to-start / no-credit-card disclaimer.
function isMetaText(node) {
  const t = (node.textContent || '').toLowerCase();
  return /free to start|credit card|no credit/.test(t);
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // Lift MEP markers off the EDS row/cell wrapper before we rebuild.
  const inner = el.querySelector(':scope > div > div');
  if (inner) preserveMepAttrs(inner.parentElement, el);

  // Collect authored media + text in document order from the flat DA serialization.
  const imgs = [...el.querySelectorAll('img')];
  const paras = [...el.querySelectorAll('p, h2, h3, h4, h5, h6, span')]
    .filter((n) => !n.querySelector('img') && (n.textContent || '').trim());

  const capImgs = imgs.filter((img) => !isBadgeImg(img));
  const badgeImgs = imgs.filter(isBadgeImg);
  const metaNode = paras.find(isMetaText);
  const captions = paras.filter((p) => p !== metaNode);

  // Rebuild the capability grid: one tile per capability image, paired with the
  // next caption in document order.
  const grid = createTag('div', { class: 'cap__grid' });
  capImgs.forEach((img, i) => {
    const item = createTag('div', { class: 'cap__item' });
    img.setAttribute('daa-im', 'true');
    const media = img.closest('picture') || img;
    item.appendChild(media);
    const caption = captions[i];
    if (caption) {
      caption.classList.add('cap__caption');
      item.appendChild(caption);
    }
    grid.appendChild(item);
  });

  // Rebuild the store-badge row + meta line.
  const wrap = createTag('div', { class: 'wrap' });
  wrap.appendChild(grid);

  if (badgeImgs.length || metaNode) {
    const badges = createTag('div', { class: 'badges' });
    badgeImgs.forEach((img) => {
      img.setAttribute('daa-im', 'true');
      badges.appendChild(img.closest('picture') || img);
    });
    if (metaNode) {
      const meta = createTag('span', { class: 'meta' });
      meta.textContent = (metaNode.textContent || '').trim();
      badges.appendChild(meta);
    }
    wrap.appendChild(badges);
  }

  el.replaceChildren(wrap);
  el.dataset.forgeAuthored = BLOCK;
}
