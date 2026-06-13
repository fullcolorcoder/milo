const BLOCK = 'forge-roller';
const INTERVAL_MS = 3000;

function copyMepAttrs(src, dest) {
  for (const { name, value } of src.attributes) {
    if (name === 'data-manifest-id' || name === 'data-adobe-target-testid' || name.startsWith('data-mep-')) {
      dest.setAttribute(name, value);
    }
  }
}

function buildMedia(picture, badgeSvg) {
  const div = document.createElement('div');
  div.className = 'roller-media';
  if (picture) {
    const img = picture.querySelector('img');
    if (img) img.setAttribute('daa-im', '1');
    div.appendChild(picture);
  }
  if (badgeSvg) {
    const badge = document.createElement('span');
    badge.className = 'bento-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.appendChild(badgeSvg);
    div.appendChild(badge);
  }
  return div;
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) { el.dataset.forgeAuthored = BLOCK; return; }

  // Row 0: background picture
  const bgPicture = rows[0]?.querySelector('picture');

  // Row 1: headline — first <p> is eyebrow, first heading is title
  const headlineCell = rows[1]?.querySelector(':scope > div');

  // Row 2: category label
  const catCell = rows[2]?.querySelector(':scope > div');

  // Rows 3+: app entries — 1-cell (name only) or 2-cell (name | picture + badge)
  const apps = rows.slice(3).map((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const name = cells[0]?.querySelector('p')?.textContent?.trim()
      || cells[0]?.textContent?.trim() || '';
    const picture = cells[1]?.querySelector('picture') || null;
    const badgeSvg = cells[1]?.querySelector('svg') || null;
    return { name, picture, badgeSvg };
  }).filter((a) => a.name);

  const frag = document.createDocumentFragment();

  // Background image
  if (bgPicture) {
    const bgImg = bgPicture.querySelector('img');
    if (bgImg) {
      bgImg.classList.add('roller-bgimg');
      bgImg.setAttribute('aria-hidden', 'true');
      if (!bgImg.getAttribute('alt')) bgImg.setAttribute('alt', '');
    }
    frag.appendChild(bgPicture);
  }

  // Dark tint overlay
  const tint = document.createElement('div');
  tint.className = 'roller-bgtint';
  frag.appendChild(tint);

  // Two-column inner layout
  const inner = document.createElement('div');
  inner.className = 'roller-inner';

  // ---- Left panel ----
  const left = document.createElement('div');
  left.className = 'roller-left';

  // Headline block
  const headlineDiv = document.createElement('div');
  headlineDiv.className = 'roller-headline';
  if (headlineCell) {
    const eyebrowEl = headlineCell.querySelector('p');
    if (eyebrowEl) {
      eyebrowEl.classList.add('t-eyebrow');
      headlineDiv.appendChild(eyebrowEl);
    }
    const hSrc = headlineCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (hSrc) {
      let titleEl = hSrc;
      if (hSrc.tagName === 'H1') {
        // L8: ≤1 h1 — promote authored h1 to h2
        const h2 = document.createElement('h2');
        h2.className = hSrc.className;
        h2.innerHTML = hSrc.innerHTML;
        copyMepAttrs(hSrc, h2);
        titleEl = h2;
      }
      titleEl.classList.add('t-title2');
      headlineDiv.appendChild(titleEl);
    }
  }
  left.appendChild(headlineDiv);

  // Category + divider + scrollable app list
  const listArea = document.createElement('div');

  const catLabel = document.createElement('div');
  catLabel.className = 'roller-cat t-h6';
  catLabel.textContent = catCell?.querySelector('p')?.textContent?.trim() || '';
  listArea.appendChild(catLabel);

  const dividerEl = document.createElement('div');
  dividerEl.className = 'roller-divider';
  listArea.appendChild(dividerEl);

  const rollerWindow = document.createElement('div');
  rollerWindow.className = 'roller-window';

  const rollerList = document.createElement('div');
  rollerList.className = 'roller-list t-super';

  const listItems = apps.map((app) => {
    const item = document.createElement('div');
    item.textContent = app.name;
    return item;
  });

  const firstFeatIdx = apps.findIndex((a) => a.picture);
  if (firstFeatIdx >= 0) listItems[firstFeatIdx].classList.add('active');

  listItems.forEach((item) => rollerList.appendChild(item));
  rollerWindow.appendChild(rollerList);
  listArea.appendChild(rollerWindow);
  left.appendChild(listArea);

  // ---- Right panel ----
  const right = document.createElement('div');
  right.className = 'roller-right';

  const initFeat = firstFeatIdx >= 0 ? apps[firstFeatIdx] : null;
  if (initFeat) right.appendChild(buildMedia(initFeat.picture, initFeat.badgeSvg));

  inner.appendChild(left);
  inner.appendChild(right);
  frag.appendChild(inner);

  el.replaceChildren(frag);
  el.dataset.forgeAuthored = BLOCK;

  // ---- Roller animation ----
  // Only when multiple featured apps exist and the user allows motion
  const featApps = apps.filter((a) => a.picture);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  if (featApps.length > 1 && !reducedMotion) {
    let featIdx = 0;

    function positionList(globalIdx) {
      const item = listItems[globalIdx];
      if (!item) return;
      const raw = item.offsetTop + item.offsetHeight / 2 - rollerWindow.offsetHeight / 2;
      const maxOffset = Math.max(0, rollerList.offsetHeight - rollerWindow.offsetHeight);
      rollerList.style.transform = `translateY(${-Math.min(Math.max(0, raw), maxOffset)}px)`;
    }

    function activateFeat(nextFeatIdx) {
      const app = featApps[nextFeatIdx];
      const globalIdx = apps.indexOf(app);
      listItems.forEach((li) => li.classList.remove('active'));
      if (listItems[globalIdx]) listItems[globalIdx].classList.add('active');
      positionList(globalIdx);
      right.replaceChildren(buildMedia(app.picture, app.badgeSvg));
    }

    // Position the initial active item after paint
    requestAnimationFrame(() => positionList(firstFeatIdx));

    const iv = setInterval(() => {
      featIdx = (featIdx + 1) % featApps.length;
      activateFeat(featIdx);
    }, INTERVAL_MS);

    // Release the interval when the block leaves the DOM
    const obs = new MutationObserver(() => {
      if (!document.contains(el)) { clearInterval(iv); obs.disconnect(); }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
}
