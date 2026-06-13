const BLOCK = 'forge-faq';

function toggleFaq(btn) {
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
}

function stampAnalytics(root) {
  root.querySelectorAll('a[href], button').forEach((node) => {
    if (node.hasAttribute('daa-ll')) return;
    const label = node.getAttribute('aria-label')
      || node.querySelector('.faq-question')?.textContent?.trim().slice(0, 50)
      || node.textContent.trim().slice(0, 50)
      || node.className.split(' ').find(Boolean)
      || 'link';
    node.setAttribute('daa-ll', label);
  });
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  // Un-wrap EDS single-cell block wrappers so the scoped CSS targets the natural DOM structure.
  const inner = el.querySelector(':scope > div > div');
  if (inner) {
    while (inner.firstChild) el.appendChild(inner.firstChild);
    inner.parentElement?.remove();
  }

  // Wire accordion toggle on each FAQ question button.
  el.querySelectorAll('.faq-q').forEach((btn) => {
    btn.addEventListener('click', () => toggleFaq(btn));
  });

  stampAnalytics(el);
  el.dataset.forgeAuthored = BLOCK;
}
