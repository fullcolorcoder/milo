const BLOCK = 'forge-trust';

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

  // Unwrap EDS single-cell block wrapper so scoped CSS targets the natural DOM structure
  const inner = el.querySelector(':scope > div > div');
  if (inner) {
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  stampAnalytics(el);
  el.dataset.forgeAuthored = BLOCK;
}
