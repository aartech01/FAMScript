function exportSVG(svgEl) {
  const data = new XMLSerializer().serializeToString(svgEl);
  downloadBlob(new Blob([data], { type: 'image/svg+xml;charset=utf-8' }), 'family-tree.svg');
}

function exportPNG(svgEl) { _svgToRaster(svgEl, 'image/png',  'family-tree.png'); }
function exportJPG(svgEl) { _svgToRaster(svgEl, 'image/jpeg', 'family-tree.jpg'); }

function _svgToRaster(svgEl, mime, filename) {
  const vb = svgEl.viewBox?.baseVal;
  const w  = (vb && vb.width  > 0) ? vb.width  : (svgEl.getBoundingClientRect().width  || 1400);
  const h  = (vb && vb.height > 0) ? vb.height : (svgEl.getBoundingClientRect().height || 900);

  const clone = svgEl.cloneNode(true);
  if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width',  w);
  clone.setAttribute('height', h);

  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

  // FileReader produces a proper base64 data URL without manual encoding issues
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width  = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);
      _drawWatermark(ctx, w, h);

      canvas.toBlob(function (blob) {
        if (blob) downloadBlob(blob, filename);
        else alert('Export failed: canvas produced no output.');
      }, mime, 0.95);
    };
    img.onerror = function () {
      alert('Export failed: SVG could not be rendered as an image.');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(svgBlob);
}

function _drawWatermark(ctx, w, h) {
  const label   = 'FamScript';
  const fontSize = Math.max(11, Math.round(Math.min(w, h) * 0.022));
  const logoSz   = fontSize + 4;
  const gap      = 5;
  const padX     = 9, padY = 6;
  const margin   = 14;

  ctx.save();
  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  const textW = ctx.measureText(label).width;

  const boxW = padX + logoSz + gap + textW + padX;
  const boxH = logoSz + padY * 2;
  const bx   = w - boxW - margin;
  const by   = h - boxH - margin;

  // dark pill background
  ctx.fillStyle = 'rgba(8,8,14,0.82)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(bx, by, boxW, boxH, 5);
  } else {
    ctx.rect(bx, by, boxW, boxH);
  }
  ctx.fill();

  // lime FS logo square
  ctx.fillStyle = '#C8FF3E';
  const lx = bx + padX;
  const ly = by + padY;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(lx, ly, logoSz, logoSz, 3);
  } else {
    ctx.rect(lx, ly, logoSz, logoSz);
  }
  ctx.fill();

  ctx.fillStyle = '#08080E';
  ctx.font = `800 ${Math.round(logoSz * 0.54)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FS', lx + logoSz / 2, ly + logoSz / 2);

  // label
  ctx.fillStyle    = '#eaeaf5';
  ctx.font         = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, lx + logoSz + gap, by + boxH / 2);

  ctx.restore();
}

function exportMarkdown(mermaidCode, projectName, suffix) {
  const base = (projectName || 'family-tree').replace(/\s+/g, '-').toLowerCase();
  const filename = suffix ? `${base}-${suffix}-mermaid.md` : `${base}-mermaid.md`;
  const title = projectName || 'Family Tree';
  const md = `# ${title}${suffix ? ` — ${suffix.charAt(0).toUpperCase() + suffix.slice(1)}'s Side` : ''}\n\n\`\`\`mermaid\n${mermaidCode}\n\`\`\`\n`;
  downloadBlob(new Blob([md], { type: 'text/markdown;charset=utf-8' }), filename);
}

function exportJSON(model, projectName, settings) {
  const payload = {
    projectName: projectName || 'Family Tree',
    version: '1.0',
    nodes: model.nodes,
    relations: model.relations,
    settings: settings || { theme: 'default' },
  };
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }),
    'family-tree.json'
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
