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

/* ===== 2D split scene ===== */
const SPLIT = { gap: 28, padTop: 14, padBottom: 14 };

/* ===== 2.5D stack scene ===== */
const STACK = {
  sep: -250,
  padTop: 70,
  padBottom: 70,
  shiftX: 55,      // мезонин правее (hover)
  mezzScale: 0.985 // слегка меньше (ощущение высоты)
};

/* ===== Categories (цвет плашек) ===== */
const CATEGORIES = {
  nav:     { color:'#0a0a0a' },
  service: { color:'#e1062c' },
  shop:    { color:'#e1062c' },
  food:    { color:'#e1062c' },
};

/* ===== ТВОИ ТОЧКИ (пресет) ===== */
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

/* ===== Locations ===== */
const LOCATIONS = [
  // floor 1
  { id:'entrance',  name:'Главный вход',   icon:'ВХОД',  cat:'nav',     floor:1 },
  { id:'reception', name:'Рецепция',       icon:'КАССА', cat:'service', floor:1 },
  { id:'bookshop',  name:'Книжный магазин',icon:'КНИГИ', cat:'shop',    floor:1 },
  { id:'cafe',      name:'Кафе',           icon:'КАФЕ',  cat:'food',    floor:1 },
  { id:'wc_f1',     name:'Туалет',         icon:'WC',    cat:'service', floor:1 },
  { id:'cooler_f1', name:'Кулер',          icon:'H2O',   cat:'service', floor:1 },

  { id:'elevator',  name:'Лифт',           icon:'ЛИФТ',  cat:'nav',     floor:1 },
  { id:'stairs',    name:'Лестница 1',     icon:'ЛСТ1',  cat:'nav',     floor:1 },
  { id:'stairs2',   name:'Лестница 2',     icon:'ЛСТ2',  cat:'nav',     floor:1 },

  // floor 1.5
  { id:'stairs15',    name:'Лестница (1½)', icon:'ЛСТ½', cat:'nav',     floor:1.5 },
  { id:'wardrobe',    name:'Гардероб',      icon:'ГАРД', cat:'service', floor:1.5 },
  { id:'lockers',     name:'Локеры',        icon:'LOCK', cat:'service', floor:1.5 },
  { id:'wc_mezz',     name:'Туалет (1½)',   icon:'WC',   cat:'service', floor:1.5 },
  { id:'cooler_mezz', name:'Кулер (1½)',    icon:'H2O',  cat:'service', floor:1.5 },
];

const nodeById = new Map(LOCATIONS.map(n => [n.id, n]));

/* ===== Graph edges =====
   ВАЖНО: переход уровня ТОЛЬКО по stairs <-> stairs15
*/
const EDGES = [
  // floor 1 core
  ['entrance','reception'],
  ['reception','bookshop'],
  ['reception','cafe'],
  ['reception','wc_f1'],
  ['reception','cooler_f1'],
  ['reception','stairs'],
  ['reception','elevator'],

  // stairs2 near elevator
  ['elevator','stairs2'],
  ['stairs2','reception'],

  // межэтажный переход
  ['stairs','stairs15'],

  // mezz core
  ['stairs15','wardrobe'],
  ['wardrobe','lockers'],
  ['wardrobe','wc_mezz'],
  ['wardrobe','cooler_mezz'],
];

const graph = new Map();
for (const n of LOCATIONS) graph.set(n.id, []);
for (const [a,b] of EDGES) {
  if (!graph.has(a) || !graph.has(b)) continue;
  graph.get(a).push(b);
  graph.get(b).push(a);
}

/* ===== LocalStorage overrides (разметка) ===== */
function lsKey(id) { return `zotov.loc.${id}`; }
function getOverride(id) {
  try {
    const raw = localStorage.getItem(lsKey(id));
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (typeof v?.x === 'number' && typeof v?.y === 'number') return v;
    return null;
  } catch { return null; }
}
function setOverride(id, x, y) {
  localStorage.setItem(lsKey(id), JSON.stringify({ x, y }));
}
function clearOverride(id) { localStorage.removeItem(lsKey(id)); }

function getXY(n) {
  const ov = getOverride(n.id);
  if (ov) return { x: ov.x, y: ov.y };
  const pr = PRESET_POINTS[n.id];
  if (pr) return { x: pr.x, y: pr.y };
  // fallback (не должен понадобиться)
  return { x: 0, y: 0 };
}

/* ===== Dijkstra ===== */
function dist(aId, bId) {
  const a = nodeById.get(aId);
  const b = nodeById.get(bId);
  if (!a || !b) return Infinity;
  const pa = getXY(a), pb = getXY(b);
  let d = Math.hypot(pa.x - pb.x, pa.y - pb.y);
  if (a.floor !== b.floor) d += 120;
  return d;
}

function dijkstra(startId, endId) {
  const D = new Map();
  const prev = new Map();
  for (const n of LOCATIONS) D.set(n.id, Infinity);
  D.set(startId, 0);

  const pq = [[0, startId]];
  while (pq.length) {
    pq.sort((x,y) => x[0]-y[0]);
    const [cd, u] = pq.shift();
    if (cd !== D.get(u)) continue;
    if (u === endId) break;

    for (const v of graph.get(u) || []) {
      const nd = cd + dist(u, v);
      if (nd < D.get(v)) {
        D.set(v, nd);
        prev.set(v, u);
        pq.push([nd, v]);
      }
    }
  }

  if (!isFinite(D.get(endId))) return null;
  const path = [];
  for (let cur = endId; cur; cur = prev.get(cur)) path.unshift(cur);
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
  editMode: false,

  yahId: '',
  qrRendered: false,
};

/* ===== DOM ===== */
const el = {
  mode2d: $('#mode-2d'),
  mode25d: $('#mode-25d'),
  svgSplit: $('#svg-split'),
  svgStack: $('#svg-stack'),

  floorLabel: $('#floor-label'),
  btnMode: $('#btn-mode'),

  btnFloorMezz: $('#btn-floor-mezz'),
  btnFloorF1: $('#btn-floor-f1'),

  selFrom: $('#sel-from'),
  selTo: $('#sel-to'),
  clickBar: $('#click-bar'),

  routeResult: $('#route-result'),
  routeMeta: $('#route-meta'),
  stepsList: $('#steps-list'),

  selEdit: $('#sel-edit'),
  btnEditToggle: $('#btn-edit-toggle'),
  editStatus: $('#edit-status'),

  qrGrid: $('#qr-grid'),

  yahBanner: $('#yah-banner'),
  yahName: $('#yah-name'),

  tabNav: $('#tab-nav'),
  tabSched: $('#tab-sched'),
  tabQr: $('#tab-qr'),
  panelNav: $('#panel-nav'),
  panelSched: $('#panel-sched'),
  panelQr: $('#panel-qr'),
};

const SVG_NS = 'http://www.w3.org/2000/svg';
function sEl(tag) { return document.createElementNS(SVG_NS, tag); }

/* ===== Tabs ===== */
window.switchTab = function(which){
  el.tabNav?.classList.toggle('active', which === 'nav');
  el.tabSched?.classList.toggle('active', which === 'sched');
  el.tabQr?.classList.toggle('active', which === 'qr');

  if (el.panelNav) el.panelNav.style.display = which === 'nav' ? '' : 'none';
  if (el.panelSched) el.panelSched.style.display = which === 'sched' ? '' : 'none';
  if (el.panelQr) el.panelQr.style.display = which === 'qr' ? '' : 'none';

  if (which === 'qr' && !state.qrRendered) renderQR();
};

/* ===== Mode toggle ===== */
window.toggleMode = function(){
  state.mode = (state.mode === '2d') ? '25d' : '2d';
  const is25 = state.mode === '25d';
  el.mode2d.style.display = is25 ? 'none' : 'flex';
  el.mode25d.style.display = is25 ? 'flex' : 'none';
  el.btnMode.textContent = is25 ? '2D' : '2.5D';
  renderAll();
};

/* ===== Focus ===== */
window.setFocus = function(f){
  state.focus = f;
  el.btnFloorMezz.classList.toggle('active', f === 1.5);
  el.btnFloorF1.classList.toggle('active', f === 1);
  renderAll();
};

/* ===== Zoom ===== */
window.zoomIn = function(){ state.zoom = clamp(state.zoom * 1.2, 0.6, 3); renderAll(); };
window.zoomOut = function(){ state.zoom = clamp(state.zoom / 1.2, 0.6, 3); renderAll(); };
window.addEventListener('resize', () => renderAll());

/* ===== Selects ===== */
function fillSelects() {
  const items = LOCATIONS.slice().sort((a,b) => (a.floor - b.floor) || a.name.localeCompare(b.name, 'ru'));

  const fill = (sel) => {
    sel.innerHTML = '';
    const o0 = document.createElement('option');
    o0.value = '';
    o0.textContent = '— выберите —';
    sel.appendChild(o0);

    for (const it of items) {
      const o = document.createElement('option');
      o.value = it.id;
      o.textContent = `${it.name} — ${it.floor === 1.5 ? '1½' : '1'}`;
      sel.appendChild(o);
    }
  };

  fill(el.selFrom);
  fill(el.selTo);
  fill(el.selEdit);

  el.selFrom.onchange = () => { state.fromId = el.selFrom.value; renderAll(); };
  el.selTo.onchange = () => { state.toId = el.selTo.value; renderAll(); };
}

/* ===== Route actions ===== */
window.buildRoute = function(){
  if (!state.fromId || !state.toId) return;

  const r = dijkstra(state.fromId, state.toId);
  if (!r) {
    el.routeResult.style.display = 'block';
    el.routeMeta.textContent = 'Маршрут не найден (проверь EDGES).';
    el.stepsList.innerHTML = '';
    return;
  }

  state.route = r;
  el.routeResult.style.display = 'block';
  el.routeMeta.textContent = `Узлов: ${r.path.length} · Длина (условно): ${Math.round(r.totalDist)}`;
  renderSteps(r.path);
  renderAll();
};

window.clearRoute = function(){
  state.route = null;
  el.routeResult.style.display = 'none';
  el.stepsList.innerHTML = '';
  renderAll();
};

window.swapPoints = function(){
  const t = state.fromId;
  state.fromId = state.toId;
  state.toId = t;
  el.selFrom.value = state.fromId;
  el.selTo.value = state.toId;
  renderAll();
};

function renderSteps(pathIds) {
  el.stepsList.innerHTML = '';
  const nodes = pathIds.map(id => nodeById.get(id)).filter(Boolean);

  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const b = nodes[i+1];

    if (b && a.floor !== b.floor) {
      const li = document.createElement('li');
      li.innerHTML = `Переход уровня через <b>${a.name}</b> → <b>${b.name}</b>.`;
      el.stepsList.appendChild(li);
      continue;
    }

    const li = document.createElement('li');
    li.innerHTML = `<b>${a.name}</b> <span style="color:#6b6b6b">(${a.floor === 1.5 ? '1½' : '1'})</span>`;
    el.stepsList.appendChild(li);
  }
}

/* ===== Edit mode ===== */
window.toggleEditMode = function(){
  state.editMode = !state.editMode;
  el.btnEditToggle.textContent = state.editMode ? 'Разметка: вкл' : 'Разметка: выкл';
  el.editStatus.textContent = state.editMode ? 'Кликните по карте, чтобы поставить выбранную метку.' : '';
};

window.resetEditPoint = function(){
  const id = el.selEdit.value;
  if (!id) return;
  clearOverride(id);
  el.editStatus.textContent = 'Сброшено (вернулись к пресету).';
  renderAll();
};

window.exportPoints = function(){
  const out = {};
  for (const loc of LOCATIONS) {
    const ov = getOverride(loc.id);
    if (ov) out[loc.id] = { ...ov, floor: loc.floor };
  }
  const txt = JSON.stringify(out, null, 2);
  navigator.clipboard?.writeText(txt).catch(()=>{});
  alert('JSON скопирован в буфер (если браузер разрешил). Также выведен в console.');
  console.log('EXPORT POINTS:\n', txt);
};

window.importPointsPrompt = function(){
  const raw = prompt('Вставьте JSON с координатами (как из Экспорт JSON):');
  if (!raw) return;
  try {
    const obj = JSON.parse(raw);
    for (const [id, v] of Object.entries(obj)) {
      if (typeof v?.x === 'number' && typeof v?.y === 'number') setOverride(id, v.x, v.y);
    }
    alert('Импорт выполнен.');
    renderAll();
  } catch {
    alert('Не получилось распарсить JSON.');
  }
};

/* ===== QR ===== */
window.renderQR = function(force = false) {
  if (!el.qrGrid) return;
  if (state.qrRendered && !force) return;

  el.qrGrid.innerHTML = '';
  const baseUrl = location.href.split('?')[0];

  const items = LOCATIONS.slice().sort((a,b) => a.name.localeCompare(b.name, 'ru'));
  for (const loc of items) {
    const card = document.createElement('div');
    card.className = 'qr-card';

    const title = document.createElement('div');
    title.className = 'qr-title';
    title.textContent = loc.name;

    const sub = document.createElement('div');
    sub.className = 'qr-sub';
    sub.textContent = `Этаж: ${loc.floor === 1.5 ? '1½' : '1'} · id: ${loc.id}`;

    const box = document.createElement('div');
    box.className = 'qr-box';

    const url = `${baseUrl}?yah=${encodeURIComponent(loc.id)}`;

    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(box);
    el.qrGrid.appendChild(card);

    // eslint-disable-next-line no-undef
    new QRCode(box, {
      text: url,
      width: 128,
      height: 128,
      colorDark: "#0a0a0a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  state.qrRendered = true;
};

/* ===== SVG utils ===== */
function setSvgBase(svg, viewBoxStr) {
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('viewBox', viewBoxStr);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
}
function zoomTransform(cx, cy, z) {
  return `translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})`;
}
function imageNode(href, x, y, opacity = 1) {
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
function badge(g, txt, x, y) {
  const w = Math.max(120, txt.length * 8 + 22);
  const bg = sEl('rect');
  bg.setAttribute('x', String(x));
  bg.setAttribute('y', String(y - 16));
  bg.setAttribute('width', String(w));
  bg.setAttribute('height', '26');
  bg.setAttribute('rx', '10');
  bg.setAttribute('fill', '#fff');
  bg.setAttribute('stroke', '#0a0a0a');
  bg.setAttribute('stroke-width', '2');
  g.appendChild(bg);

  const t = sEl('text');
  t.setAttribute('x', String(x + 12));
  t.setAttribute('y', String(y));
  t.setAttribute('font-size', '13');
  t.setAttribute('font-weight', '700');
  t.setAttribute('dominant-baseline', 'central');
  t.textContent = txt;
  g.appendChild(t);
}

/* ===== Origins ===== */
function getOrigins2D() {
  const H = VIEWBOX.h;
  return {
    mezz: { x: 0, y: SPLIT.padTop },
    f1:   { x: 0, y: SPLIT.padTop + H + SPLIT.gap },
    sceneH: SPLIT.padTop + H + SPLIT.gap + H + SPLIT.padBottom
  };
}
function getOrigins25D() {
  const H = VIEWBOX.h;
  const mezzY = STACK.padTop;
  const f1Y = STACK.padTop + H + STACK.sep;
  const bottom = Math.max(mezzY + H, f1Y + H) + STACK.padBottom;
  return {
    mezz: { x: STACK.shiftX, y: mezzY },
    f1:   { x: 0,           y: f1Y },
    sceneH: bottom
  };
}
function scenePoint(loc, mode) {
  const p = getXY(loc);
  const o = (mode === '2d') ? getOrigins2D() : getOrigins25D();
  const org = (loc.floor === 1.5) ? o.mezz : o.f1;
  return { x: org.x + p.x, y: org.y + p.y };
}

/* ===== POI draw ===== */
function drawPoi(g, loc, mode) {
  const pt = scenePoint(loc, mode);

  const label = loc.icon || loc.name;
  const w = Math.max(36, label.length * 6 + 18);
  const h = 18;

  const focusDim = (loc.floor === state.focus) ? 1.0 : 0.55;
  const color = CATEGORIES[loc.cat]?.color || '#0a0a0a';

  const node = sEl('g');
  node.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
  node.style.cursor = 'pointer';
  node.style.opacity = String(focusDim);

  const rect = sEl('rect');
  rect.setAttribute('x', String(-w/2));
  rect.setAttribute('y', String(-h/2));
  rect.setAttribute('width', String(w));
  rect.setAttribute('height', String(h));
  rect.setAttribute('rx', '4');
  rect.setAttribute('fill', '#fff');

  // выделение "вы здесь"
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
  text.setAttribute('fill', loc.id === state.yahId ? '#e1062c' : color);
  text.textContent = label;

  node.appendChild(rect);
  node.appendChild(text);

  node.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.editMode) return;

    if (state.clickMode === 'from') {
      state.fromId = loc.id;
      el.selFrom.value = loc.id;
      state.clickMode = 'to';
      el.clickBar.textContent = 'Теперь кликните точку «Куда».';
    } else {
      state.toId = loc.id;
      el.selTo.value = loc.id;
      state.clickMode = 'from';
      el.clickBar.textContent = 'Теперь кликните точку «Откуда».';
    }
    renderAll();
  });

  g.appendChild(node);
}

/* ===== Route draw (segments + connector line) ===== */
function drawRoute(g, mode) {
  if (!state.route) return;

  const ids = state.route.path;
  const nodes = ids.map(id => nodeById.get(id)).filter(Boolean);
  if (nodes.length < 2) return;

  // 1) Рисуем сегменты маршрута ПО ЭТАЖАМ отдельно (сплошная линия)
  const byFloor = new Map(); // floor -> array of nodes (in order)
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!byFloor.has(n.floor)) byFloor.set(n.floor, []);
    byFloor.get(n.floor).push(n);
  }

  // НО: чтобы не соединять точки через "пропуски" другого этажа,
  // построим сегменты по последовательности и разорвём при смене пола.
  const floorSegs = { 1: [], 1.5: [] };
  let curSeg = [nodes[0]];

  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const cur = nodes[i];

    if (cur.floor === prev.floor) {
      curSeg.push(cur);
    } else {
      // закрываем сегмент
      if (curSeg.length >= 2) floorSegs[prev.floor].push(curSeg);
      curSeg = [cur]; // начинаем новый сегмент на новом этаже
    }
  }
  if (curSeg.length >= 2) floorSegs[curSeg[0].floor].push(curSeg);

  const drawSolidSeg = (segNodes, floor) => {
    const pts = segNodes.map(n => scenePoint(n, mode));
    const dStr = pts.map((p,i) => (i===0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

    const path = sEl('path');
    path.setAttribute('d', dStr);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#e1062c');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('opacity', floor === 1.5 ? '0.82' : '0.9');

    g.appendChild(path);
  };

  for (const seg of floorSegs[1])   drawSolidSeg(seg, 1);
  for (const seg of floorSegs[1.5]) drawSolidSeg(seg, 1.5);

  // 2) Пунктирные коннекторы ТОЛЬКО там, где происходит смена этажа
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    if (a.floor === b.floor) continue;

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

    // маленькие "капсы" на концах (чтобы читалось как переход)
    const cap = (x, y) => {
      const c = sEl('circle');
      c.setAttribute('cx', String(x));
      c.setAttribute('cy', String(y));
      c.setAttribute('r', '3.2');
      c.setAttribute('fill', '#ffffff');
      c.setAttribute('stroke', '#e1062c');
      c.setAttribute('stroke-width', '2');
      c.setAttribute('opacity', '0.95');
      g.appendChild(c);
    };
    cap(pa.x, pa.y);
    cap(pb.x, pb.y);
  }
}


/* ===== Edit click mapping ===== */
function clientToSvgPoint(svg, evt) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  return pt.matrixTransform(ctm.inverse());
}
function unzoomPoint(p, cx, cy, z) {
  return { x: cx + (p.x - cx)/z, y: cy + (p.y - cy)/z };
}
function bindEditClick(svg, mode) {
  svg.onclick = (evt) => {
    if (!state.editMode) return;

    const id = el.selEdit.value;
    if (!id) return;

    const loc = nodeById.get(id);
    const p0 = clientToSvgPoint(svg, evt);
    if (!p0 || !loc) return;

    const origins = (mode === '2d') ? getOrigins2D() : getOrigins25D();
    const sceneH = origins.sceneH;

    const cx = VIEWBOX.w / 2;
    const cy = sceneH / 2;
    const p = unzoomPoint(p0, cx, cy, state.zoom);

    const org = (loc.floor === 1.5) ? origins.mezz : origins.f1;
    const fx = Number((p.x - org.x).toFixed(1));
    const fy = Number((p.y - org.y).toFixed(1));

    setOverride(id, fx, fy);
    el.editStatus.textContent = `Сохранено: ${id} → x=${fx}, y=${fy} (этаж ${loc.floor === 1.5 ? '1½' : '1'})`;

    renderAll();
  };
}

/* ===== Render header label ===== */
function renderHeaderLabel() {
  const modeLabel = (state.mode === '2d') ? '2D' : '2.5D';
  const focusLabel = (state.focus === 1) ? '1' : '1½';
  el.floorLabel.textContent = `${modeLabel} · Фокус: ${focusLabel}`;
}

/* ===== Render 2D ===== */
function render2D() {
  const H = VIEWBOX.h;
  const W = VIEWBOX.w;
  const o = getOrigins2D();

  setSvgBase(el.svgSplit, `0 0 ${W} ${o.sceneH}`);
  el.svgSplit.innerHTML = '';

  const g = sEl('g');
  g.setAttribute('transform', zoomTransform(W/2, o.sceneH/2, state.zoom));
  el.svgSplit.appendChild(g);

  const focusIsMezz = state.focus === 1.5;
  const mezzHref = focusIsMezz ? ASSETS.MEZZ_LABELS : ASSETS.MEZZ_NOLABEL;

  const div = sEl('line');
  div.setAttribute('x1', '0');
  div.setAttribute('x2', String(W));
  div.setAttribute('y1', String(o.mezz.y + H + SPLIT.gap/2));
  div.setAttribute('y2', String(o.mezz.y + H + SPLIT.gap/2));
  div.setAttribute('stroke', '#0a0a0a');
  div.setAttribute('stroke-width', '2');
  div.setAttribute('opacity', '0.15');
  g.appendChild(div);

  const mezzImg = imageNode(mezzHref, o.mezz.x, o.mezz.y, focusIsMezz ? 1.0 : 0.34);
  if (!focusIsMezz) mezzImg.style.filter = 'blur(0.6px) contrast(0.95)';
  g.appendChild(mezzImg);

  const f1Img = imageNode(ASSETS.F1, o.f1.x, o.f1.y, focusIsMezz ? 0.26 : 1.0);
  if (focusIsMezz) f1Img.style.filter = 'blur(0.9px) contrast(0.92)';
  g.appendChild(f1Img);

  badge(g, focusIsMezz ? 'МЕЗОНИН 1½ · В ФОКУСЕ' : 'МЕЗОНИН 1½', 16, o.mezz.y + 24);
  badge(g, focusIsMezz ? '1-Й ЭТАЖ' : '1-Й ЭТАЖ · В ФОКУСЕ', 16, o.f1.y + 24);

  drawRoute(g, '2d');
  for (const loc of LOCATIONS) drawPoi(g, loc, '2d');

  bindEditClick(el.svgSplit, '2d');
}

/* ===== Render 2.5D ===== */
function render25D() {
  const W = VIEWBOX.w;
  const H = VIEWBOX.h;
  const o = getOrigins25D();

  setSvgBase(el.svgStack, `0 0 ${W} ${o.sceneH}`);
  el.svgStack.innerHTML = '';

  const g = sEl('g');
  g.setAttribute('transform', zoomTransform(W/2, o.sceneH/2, state.zoom));
  el.svgStack.appendChild(g);

  const focusIsMezz = state.focus === 1.5;
  const mezzHref = focusIsMezz ? ASSETS.MEZZ_LABELS : ASSETS.MEZZ_NOLABEL;

  const f1Img = imageNode(ASSETS.F1, o.f1.x, o.f1.y, focusIsMezz ? 0.18 : 1.0);
  if (focusIsMezz) f1Img.style.filter = 'blur(0.9px) contrast(0.92)';
  g.appendChild(f1Img);

  const gMezz = sEl('g');
  const cx = o.mezz.x + W/2;
  const cy = o.mezz.y + H/2;
  gMezz.setAttribute('transform', `translate(${cx} ${cy}) scale(${STACK.mezzScale}) translate(${-cx} ${-cy})`);
  g.appendChild(gMezz);

  const mezzImg = imageNode(mezzHref, o.mezz.x, o.mezz.y, focusIsMezz ? 1.0 : 0.30);
  mezzImg.style.filter = focusIsMezz
    ? 'drop-shadow(0 14px 14px rgba(0,0,0,.16))'
    : 'drop-shadow(0 10px 10px rgba(0,0,0,.10)) blur(0.6px)';
  gMezz.appendChild(mezzImg);

  badge(g, 'МЕЗОНИН 1½', 16, o.mezz.y + 24);
  badge(g, '1-Й ЭТАЖ', 16, o.f1.y + 24);

  drawRoute(g, '25d');
  for (const loc of LOCATIONS) drawPoi(g, loc, '25d');

  bindEditClick(el.svgStack, '25d');
}

/* ===== Main render ===== */
function renderAll() {
  renderHeaderLabel();
  if (state.mode === '2d') render2D();
  else render25D();
}

/* ===== Boot ===== */
function init() {
  fillSelects();

  // mode default
  el.mode2d.style.display = 'flex';
  el.mode25d.style.display = 'none';
  el.btnMode.textContent = '2.5D';

  // query ?yah=
  const q = parseQuery();
  if (q.yah && nodeById.get(q.yah)) {
    const loc = nodeById.get(q.yah);
    state.yahId = q.yah;

    el.yahBanner.style.display = '';
    el.yahName.textContent = `${loc.name} (${loc.floor === 1.5 ? '1½' : '1'})`;

    // ставим в "Откуда"
    state.fromId = loc.id;
    state.clickMode = 'to';
    el.selFrom.value = loc.id;
    el.clickBar.textContent = 'Вы здесь. Теперь выберите «Куда».';

    // фокус на его этаж
    state.focus = loc.floor;
    el.btnFloorMezz.classList.toggle('active', state.focus === 1.5);
    el.btnFloorF1.classList.toggle('active', state.focus === 1);
  }

  renderAll();
}
init();
