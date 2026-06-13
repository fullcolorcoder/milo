const BLOCK = 'forge-jumpnav';

function createJumpIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M4 8h8M9 5l3 3-3 3');
  path.setAttribute('stroke', '#fff');
  path.setAttribute('stroke-width', '1.4');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);
  return svg;
}

export default async function init(el) {
  if (!el) return;
  el.setAttribute('daa-lh', BLOCK);

  const rows = [...el.querySelectorAll(':scope > div')];
  const frag = document.createDocumentFragment();

  // Row 0 → .bg: background picture (all <source>/<img> attributes preserved via move)
  const bgCell = rows[0]?.querySelector(':scope > div');
  if (bgCell) {
    const bg = document.createElement('div');
    bg.className = 'bg';
    const picture = bgCell.querySelector('picture');
    if (picture) bg.appendChild(picture);
    frag.appendChild(bg);
  }

  // Scrim overlay — programmatic, no authored content
  const scrim = document.createElement('div');
  scrim.className = 'scrim';
  frag.appendChild(scrim);

  // Row 1 → .inner: eyebrow + heading
  const copyCell = rows[1]?.querySelector(':scope > div');
  if (copyCell) {
    const inner = document.createElement('div');
    inner.className = 'inner';

    const eyebrow = copyCell.querySelector('.appid, .t-eyebrow, span');
    if (eyebrow) {
      eyebrow.classList.add('appid', 't-eyebrow');
      inner.appendChild(eyebrow);
    }

    const heading = copyCell.querySelector('h2, h3');
    if (heading) {
      heading.classList.add('t-h2');
      inner.appendChild(heading);
    }

    frag.appendChild(inner);
  }

  // Row 2 → .jumps: jump navigation links with frosted-glass icon buttons
  const jumpsCell = rows[2]?.querySelector(':scope > div');
  if (jumpsCell) {
    const jumps = document.createElement('div');
    jumps.className = 'jumps';

    [...jumpsCell.querySelectorAll('a')].forEach((a) => {
      a.classList.add('jump', 't-h5');
      a.setAttribute('daa-ll', a.textContent.trim().toLowerCase().replace(/\s+/g, '-'));

      const jbtn = document.createElement('span');
      jbtn.className = 'jbtn';
      jbtn.setAttribute('aria-hidden', 'true');
      jbtn.appendChild(createJumpIcon());
      a.prepend(jbtn);

      jumps.appendChild(a);
    });

    frag.appendChild(jumps);
  }

  el.replaceChildren(frag);
  el.dataset.forgeAuthored = BLOCK;
}
