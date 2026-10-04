// edgeSidebars.js - Extensión de Spicetify
// Oculta los paneles laterales (biblioteca e info derecha) y los muestra al
// pasar el cursor por el borde izquierdo/derecho de la ventana.
// Si cambias el tamaño del panel (botón de ampliar biblioteca), se reajusta.
(function edgeSidebars() {
  if (!document.body || !document.head) { setTimeout(edgeSidebars, 300); return; }

  const EDGE = 8;    // px del borde que activan el panel
  const KEEP = 24;   // px extra alrededor del panel antes de cerrarlo
  const found = { left: null, right: null };
  const lastVar = { left: null, right: null };
  const VAR = { left: '--left-sidebar-width', right: '--right-sidebar-width' };
  const body = document.body;

  const style = document.createElement('style');
  style.textContent = `
    [data-edge-panel] {
      position: fixed !important;
      top: var(--edge-top) !important;
      bottom: var(--edge-bottom) !important;
      width: var(--edge-w) !important;
      min-width: 0 !important; max-width: none !important;
      height: auto !important; margin: 0 !important;
      z-index: 2147483000 !important;
      background: var(--background-base, #121212);
      border-radius: 8px;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transition: transform .2s ease, opacity .2s ease, box-shadow .2s ease;
    }
    [data-edge-panel="left"]  { left: 0 !important; right: auto !important; transform: translateX(-110%); }
    [data-edge-panel="right"] { right: 0 !important; left: auto !important; transform: translateX(110%); }
    body.sb-left-open  [data-edge-panel="left"]  { transform: none; opacity: 1; pointer-events: auto; box-shadow: 6px 0 24px rgba(0,0,0,.6); }
    body.sb-right-open [data-edge-panel="right"] { transform: none; opacity: 1; pointer-events: auto; box-shadow: -6px 0 24px rgba(0,0,0,.6); }
  `;
  document.head.appendChild(style);

  function readVar(el, side) {
    const p = el.parentElement;
    if (!p) return null;
    const v = parseFloat(getComputedStyle(p).getPropertyValue(VAR[side]));
    return v > 20 ? v : null;
  }

  function applyVars(el, r, widthOverride) {
    el.style.setProperty('--edge-top', Math.max(r.top, 0) + 'px');
    el.style.setProperty('--edge-bottom', Math.max(innerHeight - r.bottom, 0) + 'px');
    el.style.setProperty('--edge-w', (widthOverride || r.width) + 'px');
  }

  // Busca el panel (estrecho, alto y pegado al borde) que hay bajo el punto x
  function panelAt(x, side) {
    const y = Math.round(innerHeight / 2);
    let cur = document.elementFromPoint(x, y);
    let best = null;
    while (cur && cur !== body && cur !== document.documentElement) {
      const r = cur.getBoundingClientRect();
      if (r.width >= innerWidth * 0.45) break;
      if (r.width > 20) best = cur;
      cur = cur.parentElement;
    }
    if (!best) return null;
    const r = best.getBoundingClientRect();
    const tall = r.height > innerHeight * 0.5;
    const atEdge = side === 'left' ? r.left <= 20 : r.right >= innerWidth - 20;
    return tall && atEdge ? best : null;
  }

  function updateGrid() {
    const el = found.left || found.right;
    if (!el || !el.parentElement) return;
    const p = el.parentElement;
    if (getComputedStyle(p).display !== 'grid') return;
    p.style.setProperty('grid-template-columns',
      `${found.left ? '0' : 'auto'} 1fr ${found.right ? '0' : 'auto'}`, 'important');
    p.style.setProperty('column-gap', '0', 'important');
  }

  function detect() {
    let changed = false;
    for (const side of ['left', 'right']) {
      if (found[side] && !found[side].isConnected) { found[side] = null; changed = true; }
      if (found[side]) continue;
      const el = panelAt(side === 'left' ? 24 : innerWidth - 24, side);
      if (!el) continue;
      applyVars(el, el.getBoundingClientRect());
      el.setAttribute('data-edge-panel', side);
      lastVar[side] = readVar(el, side);
      found[side] = el;
      changed = true;
    }
    if (changed) updateGrid();
  }
  setTimeout(detect, 1500);
  setInterval(detect, 1500);

  // Vuelve a medir el ancho "natural" del panel (sin parpadeo: todo ocurre en un
  // mismo ciclo, el navegador no llega a pintar el estado intermedio).
  function measure(side) {
    const el = found[side];
    if (!el || !el.isConnected) return;
    const p = el.parentElement;
    const isGrid = p && getComputedStyle(p).display === 'grid';
    const oldW = parseFloat(el.style.getPropertyValue('--edge-w')) || 0;

    el.style.transition = 'none';
    el.removeAttribute('data-edge-panel');
    if (isGrid) {
      p.style.removeProperty('grid-template-columns');
      p.style.removeProperty('column-gap');
    }
    const r = el.getBoundingClientRect();
    let w = r.width;

    // Si el ancho natural no cambió pero la variable de Spotify sí, usamos la variable
    const v = readVar(el, side);
    if (Math.abs(w - oldW) < 1 && v && v !== lastVar[side]) w = v;
    lastVar[side] = v;

    if (w > 20) applyVars(el, r, w);
    el.setAttribute('data-edge-panel', side);
    updateGrid();
    void el.offsetWidth;
    el.style.removeProperty('transition');
    console.log('[edgeSidebars]', side, 'ancho →', Math.round(w));
  }

  // Al hacer clic dentro de un panel (p. ej. botón de ampliar biblioteca), reajusta
  function onPanelInteract(e) {
    for (const side of ['left', 'right']) {
      if (found[side] && found[side].contains(e.target)) {
        [100, 350, 800].forEach((t) => setTimeout(() => measure(side), t));
      }
    }
  }
  document.addEventListener('click', onPanelInteract, true);
  document.addEventListener('mouseup', onPanelInteract, true);

  document.addEventListener('mousemove', (e) => {
    const x = e.clientX, w = innerWidth;
    if (found.left) {
      if (body.classList.contains('sb-left-open')) {
        if (x > found.left.getBoundingClientRect().right + KEEP) body.classList.remove('sb-left-open');
      } else if (x <= EDGE) body.classList.add('sb-left-open');
    }
    if (found.right) {
      if (body.classList.contains('sb-right-open')) {
        if (x < found.right.getBoundingClientRect().left - KEEP) body.classList.remove('sb-right-open');
      } else if (x >= w - EDGE) body.classList.add('sb-right-open');
    }
  });
  document.addEventListener('mouseleave', () => body.classList.remove('sb-left-open', 'sb-right-open'));
})();
