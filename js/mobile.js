const $ = (sel) => document.querySelector(sel);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function parseQuery() {
  const q = new URLSearchParams(location.search);
  return Object.fromEntries(q.entries());
}

/* ===== Assets ===== */
const ASSETS = {
  F1: 'assets/svg/first_floor_with-labels_section.svg',
  MEZZ_LABELS: 'assets/svg/first-half_floor_with-labels_section.svg',
  MEZZ_NOLABEL:'assets/svg/first-half_floor_without-labels_section.svg',
};

const VIEWBOX = { w: 800.71, h: 336.44 };

/* ===== Scenes ===== */
const SPLIT = { gap: 24, padTop: 12, padBottom: 12 };
const STACK = {
  sep: -240,
  padTop: 60,
  padBottom: 60,
  shiftX: 55,
  mezzScale: 0.985
};

/* ===== Colors ===== */
const CATEGORIES = {
  nav:     { color:'#0a0a0a' },
  service: { color:'#e1062c' },
  shop:    { color:'#e1062c' },
  food:    { color:'#e1062c' },
};

/* ===== Points preset ===== */
const PRESET_POINTS = {
  entrance:    { x: 528.6, y: 215.5, floor: 1 },
  reception:   { x: 526.7, y: 129.7, floor: 1 },
  bookshop:    { x: 290.4, y: 261.7, floor: 1 },
  stairs:      { x: 478.4, y: 169.2, floor: 1 },
  stairs2:     { x: 143.5, y: 284.5, floor: 1 },
  elevator:    { x: 115.0, y: 238.6, floor: 1 },
  cafe:        { x: 760.0, y: 177.9, floor: 1 },
  wc_f1:       { x: 592.4, y: 132.9, floor: 1 },
  cooler_f1:   { x: 392.3, y: 106.3, floor: 1 },

  wardrobe:    { x: 603.8, y: 143.2, floor: 1.5 },
  lockers:     { x: 680.3, y: 207.0, floor: 1.5 },
  wc_mezz:     { x: 528.8, y: 136.4, floor: 1.5 },
  cooler_mezz: { x: 604.0, y: 204.7, floor: 1.5 },
  stairs15:    { x: 478.4, y: 171.1, floor: 1.5 },
};

const LOCATIONS = [
  { id:'entrance',  name:'Главный вход',   icon:'ВХОД',  cat:'nav',     floor:1 },
  { id:'reception', name:'Рецепция',       icon:'КАССА', cat:'service', floor:1 },
  { id:'bookshop',  name:'Книжный магазин',icon:'КНИГИ', cat:'shop',    floor:1 },
  { id:'cafe',      name:'Кафе',           icon:'КАФЕ',  cat:'food',    floor:1 },
  { id:'wc_f1',     name:'Туалет',         icon:'WC',    cat:'service', floor:1 },
  { id:'cooler_f1', name:'Кулер',          icon:'H2O',   cat:'service', floor:1 },
  { id:'elevator',  name:'Лифт',           icon:'ЛИФТ',  cat:'nav',     floor:1 },
  { id:'stairs',    name:'Лестница 1',     icon:'ЛСТ1',  cat:'nav',     floor:1 },
  { id:'stairs2',   name:'Лестница 2',     icon:'ЛСТ2',  cat:'nav',     floor:1 },

  { id:'stairs15',    name:'Лестница (1½)', icon:'ЛСТ½', cat:'nav',     floor:1.5 },
  { id:'wardrobe',    name:'Гардероб',      icon:'ГАРД', cat:'service', floor:1.5 },
  { id:'lockers',     name:'Локеры',        icon:'LOCK', cat:'service', floor:1.5 },
  { id:'wc_mezz',     name:'Туалет (1½)',   icon:'WC',   cat:'service', floor:1.5 },
  { id:'cooler_mezz', name:'Кулер (1½)',    icon:'H2O',  cat:'service', floor:1.5 },
];

const nodeById = new Map(LOCATIONS.map(n => [n.id, n]));

/* edges */
const EDGES = [
  ['entrance','reception'],
  ['reception','bookshop'],
  ['reception','cafe'],
  ['reception','wc_f1'],
  ['reception','cooler_f1'],
  ['reception','stairs'],
  ['reception','elevator'],
  ['elevator','stairs2'],
  ['stairs2','reception'],
  ['stairs','stairs15'],
  ['stairs15','wardrobe'],
  ['wardrobe','lockers'],
  ['wardrobe','wc_mezz'],
  ['wardrobe','cooler_mezz'],
];

const graph = new Map();
for (const n of LOCATIONS) graph.set(n.id, []);
for (const [a,b] of EDGES) { graph.get(a)?.push(b); graph.get(b)?.push(a); }

function getXY(n){ return { x: PRESET_POINTS[n.id].x, y: PRESET_POINTS[n.id].y }; }

function dist(aId, bId){
  const a = nodeById.get(aId), b = nodeById.get(bId);
  const pa = getXY(a), pb = getXY(b);
  let d = Math.hypot(pa.x - pb.x, pa.y - pb.y);
  if (a.floor !== b.floor) d += 120;
  return d;
}

function dijkstra(startId, endId){
  const D = new Map(), prev = new Map();
  for (const n of LOCATIONS) D.set(n.id, Infinity);
  D.set(startId, 0);

  const pq = [[0, startId]];
  while (pq.length){
    pq.sort((x,y)=>x[0]-y[0]);
    const [cd,u] = pq.shift();
    if (cd !== D.get(u)) continue;
    if (u === endId) break;

    for (const v of graph.get(u) || []) {
      const nd = cd + dist(u,v);
      if (nd < D.get(v)) {
        D.set(v, nd);
        prev.set(v, u);
        pq.push([nd, v]);
      }
    }
  }

  if (!isFinite(D.get(endId))) return null;
  const path = [];
  for (let cur=endId; cur; cur=prev.get(cur)) path.unshift(cur);
  return { path, totalDist: D.get(endId) };
}

/* ===== State ===== */
const state = {
  mode: '2d',
  focus: 1,
  zoom: 1,
  fromId: '',
  toId: '',
  clickMode: 'from',
  route: null,
  yahId: '',
  _centerKey: '',
};

/* ===== DOM ===== */
const el = {
  status: $('#m-status'),
  viewport: $('#m-viewport'),

  svgSplit: $('#m-svg-split'),
  wrap25: $('#m-25d-wrap'),
  svgStack: $('#m-svg-stack'),

  btnMode: $('#btn-mode'),
  btnF1: $('#btn-focus-1'),
  btnM: $('#btn-focus-15'),

  selFrom: $('#sel-from'),
  selTo: $('#sel-to'),

  hint: $('#m-hint'),
  steps: $('#m-steps'),
  stepsList: $('#steps-list'),

  yah: $('#m-yah'),
  yahName: $('#m-yah-name'),
};

const SVG_NS = 'http://www.w3.org/2000/svg';
function sEl(tag){ return document.createElementNS(SVG_NS, tag); }

function setSvgBase(svg, viewBoxStr){
  svg.setAttribute('viewBox', viewBoxStr);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
}
function zoomTransform(cx, cy, z){
  return `translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})`;
}
function imageNode(href, x, y, opacity=1){
  const img = sEl('image');
  img.setAttribute('href', href);
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
  img.setAttribute('x', String(x));
  img.setAttribute('y', String(y));
  img.setAttribute('width', String(VIEWBOX.w));
  img.setAttribute('height', String(VIEWBOX.h));
  img.setAttribute('opacity', String(opacity));
  img.style.opacity = String(opacity);
  img.style.pointerEvents = 'none';
  return img;
}

function getOrigins2D(){
  const H = VIEWBOX.h;
  return {
    mezz: { x: 0, y: SPLIT.padTop },
    f1:   { x: 0, y: SPLIT.padTop + H + SPLIT.gap },
    sceneH: SPLIT.padTop + H + SPLIT.gap + H + SPLIT.padBottom
  };
}
function getOrigins25D(){
  const H = VIEWBOX.h;
  const mezzY = STACK.padTop;
  const f1Y = STACK.padTop + H + STACK.sep;
  const bottom = Math.max(mezzY + H, f1Y + H) + STACK.padBottom;
  return {
    mezz: { x: STACK.shiftX, y: mezzY },
    f1:   { x: 0, y: f1Y },
    sceneH: bottom
  };
}
function scenePoint(loc, mode){
  const p = getXY(loc);
  const o = (mode === '2d') ? getOrigins2D() : getOrigins25D();
  const org = (loc.floor === 1.5) ? o.mezz : o.f1;
  return { x: org.x + p.x, y: org.y + p.y };
}

/* ===== SCROLL ENABLE: делаем контент больше viewport ===== */
function setContentSize(sceneW, sceneH){
  const vw = el.viewport.clientWidth;
  const vh = el.viewport.clientHeight;

  // базово вписываем по ширине, чтобы было крупно
  const base = (vw / sceneW);
  const scale = base * state.zoom;

  const pxW = Math.round(sceneW * scale);
  const pxH = Math.round(sceneH * scale);

  // 2D svg
  el.svgSplit.style.width = pxW + 'px';
  el.svgSplit.style.height = pxH + 'px';
  el.svgSplit.setAttribute('width', pxW);
  el.svgSplit.setAttribute('height', pxH);

  // 2.5D: делаем wrapper тоже такого же размера, чтобы scroll работал даже с transform
  el.wrap25.style.width = pxW + 'px';
  el.wrap25.style.height = pxH + 'px';

  el.svgStack.style.width = pxW + 'px';
  el.svgStack.style.height = pxH + 'px';
  el.svgStack.setAttribute('width', pxW);
  el.svgStack.setAttribute('height', pxH);

  return { scale, pxW, pxH, vw, vh };
}

/* ===== Auto center on focus (поднимает карту в адекватную точку) ===== */
function centerOnFocus(sceneW, sceneH, scale, mode){
  const key = `${mode}|${state.focus}|${state.zoom}`;
  if (state._centerKey === key) return;
  state._centerKey = key;

  let targetY;
  if (mode === '2d') {
    const o = getOrigins2D();
    targetY = (state.focus === 1.5)
      ? (o.mezz.y + VIEWBOX.h * 0.55)
      : (o.f1.y + VIEWBOX.h * 0.55);
  } else {
    const o = getOrigins25D();
    targetY = (state.focus === 1.5)
      ? (o.mezz.y + VIEWBOX.h * 0.55)
      : (o.f1.y + VIEWBOX.h * 0.55);
  }
  const targetX = sceneW / 2;

  const pxX = targetX * scale;
  const pxY = targetY * scale;

  const maxL = el.viewport.scrollWidth - el.viewport.clientWidth;
  const maxT = el.viewport.scrollHeight - el.viewport.clientHeight;

  el.viewport.scrollLeft = clamp(pxX - el.viewport.clientWidth / 2, 0, Math.max(0, maxL));
  el.viewport.scrollTop  = clamp(pxY - el.viewport.clientHeight / 2, 0, Math.max(0, maxT));
}

/* ===== POI ===== */
function drawPoi(g, loc, mode){
  const pt = scenePoint(loc, mode);

  const label = loc.icon;
  const w = Math.max(40, label.length * 6 + 18);
  const h = 18;

  const color = CATEGORIES[loc.cat]?.color || '#0a0a0a';
  const dim = (loc.floor === state.focus) ? 1.0 : 0.55;

  const node = sEl('g');
  node.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
  node.style.cursor = 'pointer';
  node.style.opacity = String(dim);

  const rect = sEl('rect');
  rect.setAttribute('x', String(-w/2));
  rect.setAttribute('y', String(-h/2));
  rect.setAttribute('width', String(w));
  rect.setAttribute('height', String(h));
  rect.setAttribute('rx', '4');
  rect.setAttribute('fill', '#fff');

  if (loc.id === state.yahId) {
    rect.setAttribute('stroke', '#e1062c');
    rect.setAttribute('stroke-width', '3');
  } else {
    rect.setAttribute('stroke', color);
    rect.setAttribute('stroke-width', '2');
  }

  const text = sEl('text');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'central');
  text.setAttribute('font-size', '9');
  text.setAttribute('font-weight', '700');
  text.setAttribute('letter-spacing', '0.8');
  text.setAttribute('fill', (loc.id === state.yahId) ? '#e1062c' : color);
  text.textContent = label;

  node.appendChild(rect);
  node.appendChild(text);

  node.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.clickMode === 'from') {
      state.fromId = loc.id; el.selFrom.value = loc.id; state.clickMode = 'to';
      el.hint.textContent = 'Теперь тапните точку «Куда».';
    } else {
      state.toId = loc.id; el.selTo.value = loc.id; state.clickMode = 'from';
      el.hint.textContent = 'Теперь тапните точку «Откуда».';
    }
    renderAll();
  });

  g.appendChild(node);
}

/* dashed cross-floor connector */
function drawRoute(g, mode){
  if (!state.route) return;
  const nodes = state.route.path.map(id => nodeById.get(id)).filter(Boolean);
  if (nodes.length < 2) return;

  let seg = [nodes[0]];
  const segs = [];
  const connectors = [];

  for (let i=1;i<nodes.length;i++){
    const a = nodes[i-1], b = nodes[i];
    if (a.floor === b.floor) {
      seg.push(b);
    } else {
      if (seg.length >= 2) segs.push({ floor: a.floor, nodes: seg });
      seg = [b];
      connectors.push([a,b]);
    }
  }
  if (seg.length >= 2) segs.push({ floor: seg[0].floor, nodes: seg });

  for (const s of segs) {
    const pts = s.nodes.map(n => scenePoint(n, mode));
    const dStr = pts.map((p,i)=> i===0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(' ');
    const path = sEl('path');
    path.setAttribute('d', dStr);
    path.setAttribute('fill','none');
    path.setAttribute('stroke','#e1062c');
    path.setAttribute('stroke-width','4');
    path.setAttribute('stroke-linecap','round');
    path.setAttribute('stroke-linejoin','round');
    path.setAttribute('opacity', s.floor === 1.5 ? '0.82' : '0.9');
    g.appendChild(path);
  }

  for (const [a,b] of connectors) {
    const pa = scenePoint(a, mode);
    const pb = scenePoint(b, mode);

    const line = sEl('line');
    line.setAttribute('x1', String(pa.x));
    line.setAttribute('y1', String(pa.y));
    line.setAttribute('x2', String(pb.x));
    line.setAttribute('y2', String(pb.y));
    line.setAttribute('stroke', '#e1062c');
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-dasharray', '7 7');
    line.setAttribute('opacity', '0.75');
    g.appendChild(line);
  }
}

function fillSelects(){
  const items = LOCATIONS.slice().sort((a,b)=>(a.floor-b.floor)||a.name.localeCompare(b.name,'ru'));
  const fill = (sel) => {
    sel.innerHTML = '';
    const o0 = document.createElement('option');
    o0.value = ''; o0.textContent = '— выберите —';
    sel.appendChild(o0);
    for (const it of items) {
      const o = document.createElement('option');
      o.value = it.id;
      o.textContent = `${it.name} — ${it.floor===1.5?'1½':'1'}`;
      sel.appendChild(o);
    }
  };
  fill(el.selFrom); fill(el.selTo);

  el.selFrom.onchange = () => { state.fromId = el.selFrom.value; renderAll(); };
  el.selTo.onchange = () => { state.toId = el.selTo.value; renderAll(); };
}

/* actions */
window.toggleMode = function(){
  state.mode = (state.mode === '2d') ? '25d' : '2d';
  el.btnMode.textContent = (state.mode === '2d') ? '2D' : '2.5D';

  if (state.mode === '2d') {
    el.svgSplit.style.display = '';
    el.wrap25.style.display = 'none';
  } else {
    el.svgSplit.style.display = 'none';
    el.wrap25.style.display = 'flex';
  }
  // сбрасываем авто-центр, чтобы пересчитать
  state._centerKey = '';
  renderAll();
};

window.setFocus = function(f){
  state.focus = f;
  el.btnF1.style.borderColor = (f===1) ? '#e1062c' : '#0a0a0a';
  el.btnM.style.borderColor = (f===1.5) ? '#e1062c' : '#0a0a0a';
  state._centerKey = '';
  renderAll();
};

window.zoomIn = function(){ state.zoom = clamp(state.zoom*1.2, 0.6, 3); state._centerKey=''; renderAll(); };
window.zoomOut = function(){ state.zoom = clamp(state.zoom/1.2, 0.6, 3); state._centerKey=''; renderAll(); };

window.swapPoints = function(){
  const t = state.fromId; state.fromId = state.toId; state.toId = t;
  el.selFrom.value = state.fromId;
  el.selTo.value = state.toId;
  renderAll();
};

window.clearRoute = function(){
  state.route = null;
  el.steps.style.display = 'none';
  el.stepsList.innerHTML = '';
  renderAll();
};

window.buildRoute = function(){
  if (!state.fromId || !state.toId) return;
  const r = dijkstra(state.fromId, state.toId);
  if (!r) return;
  state.route = r;

  el.steps.style.display = '';
  el.stepsList.innerHTML = '';
  for (const id of r.path) {
    const n = nodeById.get(id);
    const li = document.createElement('li');
    li.textContent = `${n.name} (${n.floor===1.5?'1½':'1'})`;
    el.stepsList.appendChild(li);
  }
  renderAll();
};

function renderHeader(){
  el.status.textContent = `${state.mode === '2d' ? '2D' : '2.5D'} · Фокус: ${state.focus===1?'1':'1½'}`;
}

function render2D(){
  const o = getOrigins2D();
  const sceneW = VIEWBOX.w;
  const sceneH = o.sceneH;

  setSvgBase(el.svgSplit, `0 0 ${sceneW} ${sceneH}`);
  el.svgSplit.innerHTML = '';

  const g = sEl('g');
  g.setAttribute('transform', zoomTransform(sceneW/2, sceneH/2, 1)); // zoom делаем через px-size (scroll), тут 1
  el.svgSplit.appendChild(g);

  const focusIsMezz = state.focus === 1.5;
  const mezzHref = focusIsMezz ? ASSETS.MEZZ_LABELS : ASSETS.MEZZ_NOLABEL;

  const mezzImg = imageNode(mezzHref, o.mezz.x, o.mezz.y, focusIsMezz ? 1.0 : 0.34);
  if (!focusIsMezz) mezzImg.style.filter = 'blur(0.6px) contrast(0.95)';
  g.appendChild(mezzImg);

  const f1Img = imageNode(ASSETS.F1, o.f1.x, o.f1.y, focusIsMezz ? 0.26 : 1.0);
  if (focusIsMezz) f1Img.style.filter = 'blur(0.9px) contrast(0.92)';
  g.appendChild(f1Img);

  drawRoute(g, '2d');
  for (const loc of LOCATIONS) drawPoi(g, loc, '2d');

  // размеры контента + центрирование
  const { scale } = setContentSize(sceneW, sceneH);
  centerOnFocus(sceneW, sceneH, scale, '2d');
}

function render25D(){
  const o = getOrigins25D();
  const sceneW = VIEWBOX.w;
  const sceneH = o.sceneH;

  setSvgBase(el.svgStack, `0 0 ${sceneW} ${sceneH}`);
  el.svgStack.innerHTML = '';

  const g = sEl('g');
  g.setAttribute('transform', zoomTransform(sceneW/2, sceneH/2, 1));
  el.svgStack.appendChild(g);

  const focusIsMezz = state.focus === 1.5;
  const mezzHref = focusIsMezz ? ASSETS.MEZZ_LABELS : ASSETS.MEZZ_NOLABEL;

  const f1Img = imageNode(ASSETS.F1, o.f1.x, o.f1.y, focusIsMezz ? 0.18 : 1.0);
  if (focusIsMezz) f1Img.style.filter = 'blur(0.9px) contrast(0.92)';
  g.appendChild(f1Img);

  const cx = o.mezz.x + VIEWBOX.w/2;
  const cy = o.mezz.y + VIEWBOX.h/2;
  const gMezz = sEl('g');
  gMezz.setAttribute('transform', `translate(${cx} ${cy}) scale(${STACK.mezzScale}) translate(${-cx} ${-cy})`);
  g.appendChild(gMezz);

  const mezzImg = imageNode(mezzHref, o.mezz.x, o.mezz.y, focusIsMezz ? 1.0 : 0.30);
  mezzImg.style.filter = focusIsMezz
    ? 'drop-shadow(0 14px 14px rgba(0,0,0,.16))'
    : 'drop-shadow(0 10px 10px rgba(0,0,0,.10)) blur(0.6px)';
  gMezz.appendChild(mezzImg);

  drawRoute(g, '25d');
  for (const loc of LOCATIONS) drawPoi(g, loc, '25d');

  const { scale } = setContentSize(sceneW, sceneH);
  centerOnFocus(sceneW, sceneH, scale, '25d');
}

function renderAll(){
  renderHeader();
  if (state.mode === '2d') render2D();
  else render25D();
}

function init(){
  fillSelects();
  setFocus(1);

  const q = parseQuery();
  if (q.yah && nodeById.get(q.yah)) {
    state.yahId = q.yah;
    const loc = nodeById.get(q.yah);
    el.yah.style.display = '';
    el.yahName.textContent = `${loc.name} (${loc.floor===1.5?'1½':'1'})`;

    state.fromId = loc.id;
    el.selFrom.value = loc.id;
    state.clickMode = 'to';
    el.hint.textContent = 'Вы здесь. Теперь выберите «Куда».';
    setFocus(loc.floor);
  }

  // старт в 2D (обычно удобнее на мобилке)
  state.mode = '2d';
  el.btnMode.textContent = '2D';
  el.svgSplit.style.display = '';
  el.wrap25.style.display = 'none';

  renderAll();
}

init();
