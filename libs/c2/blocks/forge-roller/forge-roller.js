const BLOCK = 'forge-roller';

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const rows = [...el.querySelectorAll(':scope > div')];
  const frag = document.createDocumentFragment();

  // Row 0: background picture → div.bg + dim overlay
  const bgCell = rows[0]?.querySelector(':scope > div');
  const bgPicture = bgCell?.querySelector('picture');
  if (bgPicture) {
    const bg = document.createElement('div');
    bg.className = 'bg';
    bg.appendChild(bgPicture);
    const dim = document.createElement('div');
    dim.className = 'dim';
    bg.appendChild(dim);
    frag.appendChild(bg);
  }

  // Content wrapper: left + right columns
  const cw = document.createElement('div');
  cw.className = 'cw';

  // Left column
  const leftPanel = document.createElement('div');
  leftPanel.className = 'left';

  // Row 1 (2 cells): eyebrow | h2 heading
  const headCells = [...(rows[1]?.querySelectorAll(':scope > div') ?? [])];
  const rhead = document.createElement('div');
  rhead.className = 'rhead';

  const eyebrowText = headCells[0]?.textContent?.trim();
  if (eyebrowText) {
    const eyebrow = document.createElement('span');
    eyebrow.className = 't-eyebrow';
    eyebrow.textContent = eyebrowText;
    rhead.appendChild(eyebrow);
  }

  const titleText = headCells[1]?.textContent?.trim();
  if (titleText) {
    const title = document.createElement('span');
    title.className = 't-h2';
    title.textContent = titleText;
    rhead.appendChild(title);
  }
  leftPanel.appendChild(rhead);

  // Rows 2+: category sections
  // Each row: cell0 = category label, cell1 = app names (one <p> each),
  //           cell2 = media picture, cell3 (optional) = app icon abbreviation
  let mediaPicture = null;
  let appIconText = null;

  for (let i = 2; i < rows.length; i++) {
    const cells = [...rows[i].querySelectorAll(':scope > div')];
    if (!cells.length) continue;

    const cwrap = document.createElement('div');
    cwrap.className = 'cwrap';

    const cat = document.createElement('div');
    cat.className = 'cat t-h6';
    cat.textContent = cells[0]?.textContent?.trim() ?? '';
    cwrap.appendChild(cat);

    const divider = document.createElement('div');
    divider.className = 'divider';
    cwrap.appendChild(divider);

    const win = document.createElement('div');
    win.className = 'window';
    const list = document.createElement('div');
    list.className = 'list t-super';

    const appPs = [...(cells[1]?.querySelectorAll('p') ?? [])];
    appPs.forEach((p, idx) => {
      const item = document.createElement('p');
      item.textContent = p.textContent.trim();
      if (idx === 0) item.classList.add('active');
      list.appendChild(item);
    });
    win.appendChild(list);
    cwrap.appendChild(win);
    leftPanel.appendChild(cwrap);

    if (!mediaPicture) {
      mediaPicture = cells[2]?.querySelector('picture') ?? null;
    }
    if (!appIconText) {
      appIconText = cells[3]?.textContent?.trim() || null;
    }
  }

  cw.appendChild(leftPanel);

  // Right column: media card with picture + optional icon badge
  const rightPanel = document.createElement('div');
  rightPanel.className = 'right';

  if (mediaPicture) {
    const media = document.createElement('div');
    media.className = 'media';

    const pic = document.createElement('div');
    pic.className = 'pic';
    pic.appendChild(mediaPicture);
    media.appendChild(pic);

    if (appIconText) {
      const appicon = document.createElement('span');
      appicon.className = 'appicon';
      appicon.textContent = appIconText;
      appicon.setAttribute('aria-hidden', 'true');
      media.appendChild(appicon);
    }

    rightPanel.appendChild(media);
  }

  cw.appendChild(rightPanel);
  frag.appendChild(cw);

  el.replaceChildren(frag);
  el.dataset.forgeAuthored = BLOCK;
}
