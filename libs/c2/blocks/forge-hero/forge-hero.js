const BLOCK = 'forge-hero';

function semanticRole(node) {
  if (!node || node.nodeType !== 1) return null;
  const onlyMedia = node.matches?.('picture, img')
    || (node.querySelector?.('picture, img')
      && !node.querySelector?.('h1, h2, h3, h4, h5, h6, p, ul, ol, a, button'));
  return onlyMedia ? 'media' : 'content';
}

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

  // Un-wrap EDS single-cell block wrappers so the scoped CSS targets the natural DOM structure
  const inner = el.querySelector(':scope > div > div');
  if (inner) {
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  // Stamp Milo-semantic structural classes additively onto top-level element children
  const children = [...el.children].filter((n) => n.nodeType === 1);
  let foregroundStamped = false;
  for (const child of children) {
    const role = semanticRole(child);
    if (!role) continue;
    child.classList.add(role);
    if (role === 'content' && !foregroundStamped) {
      child.classList.add('foreground');
      foregroundStamped = true;
    }
  }

  stampAnalytics(el);
  el.dataset.forgeAuthored = BLOCK;
}
