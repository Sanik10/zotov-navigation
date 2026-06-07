/* ════════════════════════════════════════════════════════
   MOCK EVENTS — расписание мероприятий
   Структура: { roomId: [ { time, end, title, type, speaker, desc } ] }
   В будущем: заменить на API-запрос к внешнему сервису
════════════════════════════════════════════════════════ */

const EVENT_TYPES = {
  lecture:    { label:'Лекция',       color:'#5b8dd9' },
  film:       { label:'Кино',         color:'#9b59b6' },
  workshop:   { label:'Мастер-класс', color:'#27ae60' },
  exhibition: { label:'Выставка',     color:'#e67e22' },
  tour:       { label:'Экскурсия',    color:'#1abc9c' },
  talk:       { label:'Дискуссия',    color:'#f39c12' },
  special:    { label:'Спецпрограмма',color:'#e63700' },
};

const MOCK_EVENTS = {
  lecture: [
    {
      time:'10:00', end:'11:30',
      title:'Конструктивизм и современная архитектура',
      type:'lecture', speaker:'А. Рябушин',
      desc:'Лекция о влиянии советского конструктивизма на архитектуру XXI века'
    },
    {
      time:'12:00', end:'13:00',
      title:'История советского кино 1920–1930-х',
      type:'lecture', speaker:'М. Куликова',
      desc:'Как немое кино стало инструментом авангарда'
    },
    {
      time:'14:00', end:'15:30',
      title:'Графический дизайн: от Родченко до сегодня',
      type:'workshop', speaker:'Д. Фомин',
      desc:'Практический мастер-класс по принципам конструктивистской типографики'
    },
    {
      time:'16:00', end:'17:30',
      title:'Зотов: история одного места',
      type:'tour', speaker:'Е. Соколова',
      desc:'Авторская экскурсия по зданию бывшего хлебозавода № 5'
    },
    {
      time:'19:00', end:'20:30',
      title:'Будущее городских пространств',
      type:'talk', speaker:'И. Белов, С. Нарышкина',
      desc:'Дискуссия урбанистов о трансформации промышленного наследия'
    },
  ],
  cinema: [
    {
      time:'11:00', end:'12:15',
      title:'Броненосец Потёмкин (1925)',
      type:'film', speaker:'С. М. Эйзенштейн',
      desc:'Легендарная картина советского авангарда. 6+. Немой фильм с живым тапёром'
    },
    {
      time:'13:30', end:'14:40',
      title:'Человек с киноаппаратом (1929)',
      type:'film', speaker:'Д. Вертов',
      desc:'Документальный эксперимент о жизни советского города. 0+'
    },
    {
      time:'15:00', end:'16:20',
      title:'Октябрь (1928)',
      type:'film', speaker:'С. М. Эйзенштейн',
      desc:'Эпический фильм о революции 1917 года. 12+'
    },
    {
      time:'17:00', end:'18:20',
      title:'Потомок Чингисхана (1928)',
      type:'film', speaker:'В. Пудовкин',
      desc:'Авантюрная драма о монгольском пастухе в годы революции. 12+'
    },
    {
      time:'20:00', end:'21:30',
      title:'Вечер советского авангарда',
      type:'special', speaker:'Куратор: О. Фишман',
      desc:'Специальная программа: короткометражки авангардистов + Q&A'
    },
  ],
  main_hall: [
    {
      time:'10:00', end:'22:00',
      title:'Зотов. Конструктивизм как проект будущего',
      type:'exhibition', speaker:'',
      desc:'Постоянная экспозиция. Архивные материалы, макеты и инсталляции о советском конструктивизме'
    },
  ],
  hall_a: [
    {
      time:'10:00', end:'22:00',
      title:'Архитектура конструктивизма. Графика',
      type:'exhibition', speaker:'',
      desc:'Более 200 оригинальных архитектурных чертежей 1920–1930-х годов'
    },
  ],
  hall_b: [
    {
      time:'10:00', end:'22:00',
      title:'Плакаты эпохи авангарда',
      type:'exhibition', speaker:'',
      desc:'Агитационные плакаты из фондов ГМИИ им. А.С. Пушкина. До 30 июня'
    },
  ],
  hall_c: [
    {
      time:'10:00', end:'22:00',
      title:'Александр Родченко. Избранное',
      type:'exhibition', speaker:'',
      desc:'Фотографии, плакаты и живопись из частных коллекций. До 15 июля'
    },
  ],
  hall_d: [
    {
      time:'10:00', end:'22:00',
      title:'Советский дизайн 1920–1940',
      type:'exhibition', speaker:'',
      desc:'Предметы быта, мебель и промышленный дизайн эпохи авангарда'
    },
  ],
  bookshop: [
    {
      time:'10:00', end:'22:00',
      title:'Книжный магазин открыт',
      type:'special', speaker:'',
      desc:'Книги по архитектуре, дизайну, кино, философии. Уникальные издания'
    },
  ],
  cafe: [
    {
      time:'09:00', end:'22:00',
      title:'Кафе «Зотов» открыто',
      type:'special', speaker:'',
      desc:'Завтраки до 12:00. Авторская кухня. Бронирование: +7 495 XXX-XX-XX'
    },
  ],
};

/* ════════════════════════════════════════════════════════
   TIME HELPERS
════════════════════════════════════════════════════════ */

// Parse "HH:MM" → minutes from midnight
function timeToMin(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function nowStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function eventStatus(ev) {
  const now = nowMinutes();
  const s = timeToMin(ev.time);
  const e = timeToMin(ev.end);
  if (now >= s && now < e) return 'now';
  if (now >= e)             return 'past';
  return 'upcoming';
}

// Get current/next event for a room
function getRoomStatus(roomId) {
  const evs = MOCK_EVENTS[roomId];
  if (!evs) return null;
  const now = evs.find(e => eventStatus(e) === 'now');
  const next = evs.find(e => eventStatus(e) === 'upcoming');
  return { now, next };
}

/* ════════════════════════════════════════════════════════
   DATA — Locations and navigation graph
   Coordinates are in SVG viewBox space (801 × 337)
════════════════════════════════════════════════════════ */

// Floor 1
const F1W = 801, F1H = 337;
// Mezzanine (1.5) — positioned below floor 1, aligned under the stairs (stairs x≈318)
const MEZZ_W = 537, MEZZ_H = 157;
const MEZZ_X = 198;   // horizontal offset so entry (local x=120) lands under stairs (x=318)
const MEZZ_Y = 377;   // vertical offset = F1H + gap(40)
// Combined canvas
const SVGW = F1W, SVGH = MEZZ_Y + MEZZ_H; // 801 × 534

// Named locations shown on the map
const LOCATIONS = [
  // id, name, x, y, icon, category, floor, description
  { id:'entrance',    name:'Главный вход',          x:115, y:220, icon:'ВХОД',  cat:'nav',     floor:1, desc:'Центральный вход в здание' },
  { id:'reception',   name:'Касса / Рецепция',       x:188, y:216, icon:'КАССА', cat:'service', floor:1, desc:'Покупка билетов и консультации' },
  { id:'wardrobe',    name:'Гардероб',               x:390, y:455, icon:'ГАРД',  cat:'service', floor:1.5, desc:'Хранение верхней одежды — мезонин' },
  { id:'infopoint',   name:'Информационная стойка',  x:232, y:202, icon:'ИНФО',  cat:'service', floor:1, desc:'Программа мероприятий, карты' },
  { id:'bookshop',    name:'Книжный магазин',         x:248, y:122, icon:'КНИГИ', cat:'shop',    floor:1, desc:'Книги об архитектуре, дизайне, кино' },
  { id:'main_hall',   name:'Главный зал (ротонда)',   x:294, y:168, icon:'ЗАЛ',   cat:'exhibit', floor:1, desc:'Центральное выставочное пространство' },
  { id:'cinema',      name:'Кинозал',                x:313, y:152, icon:'КИНО',  cat:'hall',    floor:1, desc:'Кинопоказы и мультимедиа' },
  { id:'cafe',        name:'Кафе «Зотов»',           x:194, y:287, icon:'КАФЕ',  cat:'food',    floor:1, desc:'Кофе, завтраки и обеды' },
  { id:'elevator',    name:'Лифт',                   x:178, y:176, icon:'ЛИФТ',  cat:'nav',     floor:1, desc:'Лифт на все этажи' },
  { id:'stairs',      name:'Лестница (2–3 эт.)',     x:318, y:162, icon:'ЛСТ',   cat:'nav',     floor:1, desc:'Лестничный пролёт' },
  { id:'wc',          name:'Туалеты',                x:400, y:208, icon:'WC',    cat:'service', floor:1, desc:'Санузел' },
  { id:'lecture',     name:'Лекционный зал',         x:450, y:168, icon:'ЛЕКЦ',  cat:'hall',    floor:1, desc:'Лекции и мероприятия, 80 мест' },
  { id:'hall_a',      name:'Зал А',                  x:522, y:168, icon:'А',     cat:'exhibit', floor:1, desc:'Выставочный зал А' },
  { id:'hall_b',      name:'Зал Б',                  x:594, y:168, icon:'Б',     cat:'exhibit', floor:1, desc:'Выставочный зал Б' },
  { id:'hall_c',      name:'Зал В',                  x:660, y:168, icon:'В',     cat:'exhibit', floor:1, desc:'Выставочный зал В' },
  { id:'hall_d',      name:'Зал Г',                  x:730, y:168, icon:'Г',     cat:'exhibit', floor:1, desc:'Выставочный зал Г' },
  { id:'exit_left',   name:'Запасной выход',         x:35,  y:128, icon:'ВЫХОД', cat:'nav',     floor:1, desc:'Аварийный выход' },
];

// Invisible corridor waypoints (id, x, y)
const WAYPOINTS = [
  { id:'_w01', x:115, y:220 }, { id:'_w02', x:152, y:220 },
  { id:'_w03', x:188, y:216 }, { id:'_w04', x:216, y:210 },
  { id:'_w05', x:240, y:198 }, { id:'_w06', x:268, y:184 },
  { id:'_w07', x:290, y:172 }, { id:'_w08', x:308, y:168 },
  { id:'_w09', x:340, y:168 }, { id:'_w10', x:370, y:168 },
  { id:'_w11', x:400, y:168 }, { id:'_w12', x:400, y:200 },
  { id:'_w13', x:425, y:168 }, { id:'_w14', x:450, y:168 },
  { id:'_w15', x:522, y:168 }, { id:'_w16', x:594, y:168 },
  { id:'_w17', x:660, y:168 }, { id:'_w18', x:730, y:168 },
  { id:'_w19', x:152, y:253 }, { id:'_w20', x:152, y:287 },
  { id:'_w21', x:194, y:287 }, { id:'_w22', x:178, y:220 },
  { id:'_w23', x:178, y:176 }, { id:'_w24', x:248, y:128 },
  { id:'_w25', x:248, y:172 }, { id:'_w26', x:35,  y:220 },
  { id:'_w27', x:35,  y:128 }, { id:'_w28', x:248, y:200 },
  // Мезонин — координаты в пространстве объединённого холста
  { id:'_m01', x:318, y:455, floor:1.5 },  // вход: прямо под лестницей этажа 1
  { id:'_m02', x:350, y:455, floor:1.5 },
  { id:'_m03', x:390, y:455, floor:1.5 },
];

// All nodes = locations + waypoints
const ALL_NODES = [...LOCATIONS, ...WAYPOINTS];
const nodeById  = {};
ALL_NODES.forEach(n => nodeById[n.id] = n);

// Adjacency list (edges with distance computed from Euclidean)
const RAW_EDGES = [
  // Main corridor spine
  ['entrance','_w01'],['_w01','_w02'],['_w02','_w03'],['_w03','reception'],
  ['_w03','_w04'],['_w04','_w05'],['_w05','_w28'],['_w28','_w06'],
  ['_w06','_w07'],['_w07','main_hall'],['_w07','_w08'],
  ['_w08','cinema'],['_w08','stairs'],['_w08','_w09'],
  ['_w09','_w10'],['_w10','_w11'],['_w11','_w12'],['_w12','wc'],
  ['_w11','_w13'],['_w13','_w14'],['_w14','lecture'],
  ['lecture','_w15'],['_w15','hall_a'],['_w15','_w16'],
  ['_w16','hall_b'],['_w16','_w17'],['_w17','hall_c'],
  ['_w17','_w18'],['_w18','hall_d'],
  // South branch: wardrobe, cafe
  ['_w02','_w19'],['_w19','wardrobe'],
  ['_w19','_w20'],['_w20','_w21'],['_w21','cafe'],
  // Elevator branch
  ['_w22','elevator'],['_w22','_w23'],['_w23','elevator'],
  ['_w02','_w22'],['reception','_w22'],
  // North branch: bookshop
  ['_w05','_w25'],['_w25','_w24'],['_w24','bookshop'],
  ['_w25','infopoint'],['infopoint','_w28'],
  // Emergency exit (left strip)
  ['_w01','_w26'],['_w26','_w27'],['_w27','exit_left'],
  // Cross-floor: лестница этаж 1 → мезонин 1.5 → гардероб
  ['stairs','_m01'],
  ['_m01','_m02'],['_m02','_m03'],['_m03','wardrobe'],
];

// Build adjacency map with weights = Euclidean distance
const graph = {};
function dist(a, b) {
  const na = nodeById[a], nb = nodeById[b];
  return Math.hypot(na.x - nb.x, na.y - nb.y);
}
ALL_NODES.forEach(n => graph[n.id] = []);
RAW_EDGES.forEach(([a, b]) => {
  const d = dist(a, b);
  graph[a].push({ to: b, d });
  graph[b].push({ to: a, d });
});

/* ════════════════════════════════════════════════════════
   DIJKSTRA
════════════════════════════════════════════════════════ */
function dijkstra(startId, endId) {
  const dist  = {}, prev = {};
  const pq    = []; // [dist, id]
  ALL_NODES.forEach(n => dist[n.id] = Infinity);
  dist[startId] = 0;
  pq.push([0, startId]);

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    for (const { to, d: w } of graph[u]) {
      const nd = dist[u] + w;
      if (nd < dist[to]) {
        dist[to] = nd;
        prev[to] = u;
        pq.push([nd, to]);
      }
    }
  }

  // Reconstruct path
  if (dist[endId] === Infinity) return null;
  const path = [];
  for (let cur = endId; cur; cur = prev[cur]) path.unshift(cur);
  return { path, totalDist: dist[endId] };
}

/* ════════════════════════════════════════════════════════
   RENDER
════════════════════════════════════════════════════════ */
let scale = 1, currentFloor = 1;
let fromId = '', toId = '';

const img   = document.getElementById('floor-img');
const svgEl = document.getElementById('overlay-svg');
const wrap  = document.getElementById('map-wrap');
const tooltip = document.getElementById('tooltip');

// Scale SVG image to fill available space nicely
function initScale() {
  const area  = document.getElementById('map-area');
  const aw    = area.clientWidth - 40;
  const ah    = area.clientHeight - 40;
  const sw    = aw / SVGW;
  const sh    = ah / SVGH;
  scale = Math.min(sw, sh, 1.8);
  applyScale();
}

const mezzImg = document.getElementById('mezzanine-img');
mezzImg.style.filter = 'invert(1) brightness(0.25) sepia(0.15)';

function applyScale() {
  const totalW = SVGW * scale;
  const totalH = SVGH * scale;

  // Floor 1 image — full width at top
  img.style.width  = (F1W  * scale) + 'px';
  img.style.height = (F1H  * scale) + 'px';
  img.style.left   = '0px';
  img.style.top    = '0px';

  // Mezzanine image — positioned below, offset right to align with stairs
  mezzImg.style.width  = (MEZZ_W * scale) + 'px';
  mezzImg.style.height = (MEZZ_H * scale) + 'px';
  mezzImg.style.left   = (MEZZ_X * scale) + 'px';
  mezzImg.style.top    = (MEZZ_Y * scale) + 'px';

  // map-wrap dimensions = full canvas
  wrap.style.width  = totalW + 'px';
  wrap.style.height = totalH + 'px';

  // Overlay SVG covers full canvas
  svgEl.setAttribute('width',   totalW);
  svgEl.setAttribute('height',  totalH);
  svgEl.setAttribute('viewBox', `0 0 ${SVGW} ${SVGH}`);

  renderNodes();
}

function zoom(factor) {
  scale = Math.max(0.4, Math.min(3, scale * factor));
  applyScale();
}

/* ── Mezzanine frame, label and stair connector ── */
function drawMezzanineFrame() {
  const mk = (tag) => document.createElementNS('http://www.w3.org/2000/svg', tag);

  // Border around the mezzanine image area
  const frame = mk('rect');
  frame.setAttribute('x',      MEZZ_X);
  frame.setAttribute('y',      MEZZ_Y);
  frame.setAttribute('width',  MEZZ_W);
  frame.setAttribute('height', MEZZ_H);
  frame.setAttribute('fill',   'none');
  frame.setAttribute('stroke', '#2e3138');
  frame.setAttribute('stroke-width', '1');
  frame.setAttribute('rx', '4');
  frame.setAttribute('pointer-events', 'none');
  svgEl.appendChild(frame);

  // Label "Мезонин 1½"
  const labelBg = mk('rect');
  labelBg.setAttribute('x',      MEZZ_X + 8);
  labelBg.setAttribute('y',      MEZZ_Y - 9);
  labelBg.setAttribute('width',  74);
  labelBg.setAttribute('height', 14);
  labelBg.setAttribute('rx',     3);
  labelBg.setAttribute('fill',   '#111214');
  labelBg.setAttribute('pointer-events', 'none');
  svgEl.appendChild(labelBg);

  const labelTxt = mk('text');
  labelTxt.setAttribute('x',                 MEZZ_X + 14);
  labelTxt.setAttribute('y',                 MEZZ_Y - 1);
  labelTxt.setAttribute('font-size',         '8');
  labelTxt.setAttribute('font-weight',       '700');
  labelTxt.setAttribute('font-family',       'Inter, sans-serif');
  labelTxt.setAttribute('letter-spacing',    '0.5');
  labelTxt.setAttribute('fill',              '#e63700');
  labelTxt.setAttribute('pointer-events',    'none');
  labelTxt.textContent = 'МЕЗОНИН 1½';
  svgEl.appendChild(labelTxt);

  // Dashed connector line: stairs (318,162) → mezzanine entry (318, MEZZ_Y)
  const conn = mk('line');
  conn.setAttribute('x1',           318);
  conn.setAttribute('y1',           175);   // just below stairs node
  conn.setAttribute('x2',           318);
  conn.setAttribute('y2',           MEZZ_Y);
  conn.setAttribute('stroke',       '#e63700');
  conn.setAttribute('stroke-width', '1');
  conn.setAttribute('stroke-dasharray', '4 4');
  conn.setAttribute('opacity',      '0.45');
  conn.setAttribute('pointer-events','none');
  svgEl.appendChild(conn);

  // Arrow tip at mezzanine entry
  const arrow = mk('polygon');
  arrow.setAttribute('points', `314,${MEZZ_Y} 322,${MEZZ_Y} 318,${MEZZ_Y+6}`);
  arrow.setAttribute('fill',   '#e63700');
  arrow.setAttribute('opacity','0.6');
  arrow.setAttribute('pointer-events','none');
  svgEl.appendChild(arrow);
}

/* ── Render all POI nodes ── */
function renderNodes() {
  svgEl.innerHTML = '';

  // Route path first (under nodes)
  if (window._currentRoute) drawRoutePath(window._currentRoute);

  // ── Mezzanine: frame + label + connector to stairs ──
  drawMezzanineFrame();

  LOCATIONS.forEach(loc => {
    // Show floor 1 nodes always; show floor 1.5 nodes always (they're on the combined canvas)
    if (loc.floor !== 1 && loc.floor !== 1.5) return;
    if (!activeCats.has(loc.cat)) return;

    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('transform', `translate(${loc.x},${loc.y})`);
    g.style.cursor = 'pointer';
    g.style.pointerEvents = 'all';

    const isYAH    = youAreHereId && loc.id === youAreHereId;
    const isFrom   = !isYAH && loc.id === fromId;
    const isTo     = loc.id === toId;
    const catColor = CATEGORIES[loc.cat]?.color || '#7a7e8a';

    // Pill dimensions based on label length
    const label = loc.icon;
    const charW = label.length <= 2 ? 5.5 : 4.8;
    const pillW = Math.max(18, label.length * charW + 8);
    const pillH = 14;
    const rx    = 3;

    // ── YOU ARE HERE: animated outer rings ──
    if (isYAH) {
      // Outermost pulsing halo
      const halo = document.createElementNS('http://www.w3.org/2000/svg','rect');
      halo.setAttribute('x',      -(pillW/2 + 10));
      halo.setAttribute('y',      -(pillH/2 + 10));
      halo.setAttribute('width',  pillW + 20);
      halo.setAttribute('height', pillH + 20);
      halo.setAttribute('rx',     rx + 8);
      halo.setAttribute('fill',   'none');
      halo.setAttribute('stroke', '#e63700');
      halo.setAttribute('stroke-width', '1');
      halo.setAttribute('opacity', '0.3');
      halo.style.animation = 'yahHalo 2s ease-in-out infinite';
      g.appendChild(halo);

      // Inner glow rect
      const glow = document.createElementNS('http://www.w3.org/2000/svg','rect');
      glow.setAttribute('x',      -(pillW/2 + 5));
      glow.setAttribute('y',      -(pillH/2 + 5));
      glow.setAttribute('width',  pillW + 10);
      glow.setAttribute('height', pillH + 10);
      glow.setAttribute('rx',     rx + 4);
      glow.setAttribute('fill',   '#e6370020');
      glow.setAttribute('stroke', '#e63700');
      glow.setAttribute('stroke-width', '1.5');
      g.appendChild(glow);

    } else if (isFrom || isTo) {
      const glow = document.createElementNS('http://www.w3.org/2000/svg','rect');
      glow.setAttribute('x',      -(pillW/2 + 3));
      glow.setAttribute('y',      -(pillH/2 + 3));
      glow.setAttribute('width',  pillW + 6);
      glow.setAttribute('height', pillH + 6);
      glow.setAttribute('rx',     rx + 2);
      glow.setAttribute('fill',   isFrom ? '#4caf5018' : '#e6370018');
      glow.setAttribute('stroke', isFrom ? '#4caf50'   : '#e63700');
      glow.setAttribute('stroke-width', '1');
      g.appendChild(glow);
    }

    // ── Pill background ──
    const pill = document.createElementNS('http://www.w3.org/2000/svg','rect');
    pill.setAttribute('x',      -pillW/2);
    pill.setAttribute('y',      -pillH/2);
    pill.setAttribute('width',  pillW);
    pill.setAttribute('height', pillH);
    pill.setAttribute('rx',     rx);
    pill.setAttribute('fill',
      isYAH  ? '#e63700' :
      isFrom ? '#4caf50' :
      isTo   ? '#c72f00' : '#13151c');
    pill.setAttribute('stroke',
      isYAH  ? '#ff5533' :
      isFrom ? '#2d7a31' :
      isTo   ? '#e63700' : catColor);
    pill.setAttribute('stroke-width', isYAH ? '1.5' : '1');
    g.appendChild(pill);

    // ── Label text ──
    const fontSize = label.length <= 1 ? 8 : label.length <= 3 ? 6.5 : 5.5;
    const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('text-anchor',      'middle');
    txt.setAttribute('dominant-baseline','central');
    txt.setAttribute('font-size',        fontSize);
    txt.setAttribute('font-weight',      '700');
    txt.setAttribute('font-family',      'Inter, system-ui, sans-serif');
    txt.setAttribute('letter-spacing',   label.length >= 4 ? '0.3' : '0.5');
    txt.setAttribute('fill',  (isYAH || isFrom || isTo) ? '#fff' : catColor);
    txt.setAttribute('pointer-events', 'none');
    txt.textContent = label;
    g.appendChild(txt);

    // ── Name label below ──
    const nameLabel = document.createElementNS('http://www.w3.org/2000/svg','text');
    nameLabel.setAttribute('text-anchor',      'middle');
    nameLabel.setAttribute('dominant-baseline','hanging');
    nameLabel.setAttribute('y',            pillH / 2 + 3);
    nameLabel.setAttribute('font-size',    '7');
    nameLabel.setAttribute('font-family',  'Inter, system-ui, sans-serif');
    nameLabel.setAttribute('letter-spacing','0.2');
    nameLabel.setAttribute('fill',
      isYAH  ? '#e63700' :
      isFrom ? '#4caf50' :
      isTo   ? '#e63700' : '#4a5060');
    nameLabel.setAttribute('pointer-events', 'none');
    nameLabel.textContent = loc.name.length > 16 ? loc.name.slice(0,15)+'…' : loc.name;
    g.appendChild(nameLabel);

    // Events
    g.addEventListener('click', () => onNodeClick(loc.id, loc.x, loc.y));
    g.addEventListener('mouseenter', e => showTooltip(e, loc));
    g.addEventListener('mouseleave', () => hideTooltip());

    svgEl.appendChild(g);
  });
}

function drawRoutePath(path) {
  const pathNodes = path.map(id => nodeById[id]).filter(Boolean);
  if (pathNodes.length < 2) return;

  const d = pathNodes.map((n,i) => `${i===0?'M':'L'}${n.x},${n.y}`).join(' ');
  const len = pathLength(pathNodes);

  // Glow halo (blur effect using wider semi-transparent stroke)
  const halo = document.createElementNS('http://www.w3.org/2000/svg','path');
  halo.setAttribute('d', d);
  halo.setAttribute('stroke', '#e63700');
  halo.setAttribute('stroke-width', '10');
  halo.setAttribute('fill', 'none');
  halo.setAttribute('stroke-linecap', 'round');
  halo.setAttribute('stroke-linejoin', 'round');
  halo.setAttribute('opacity', '0.12');
  svgEl.appendChild(halo);

  // White bg track
  const bg = document.createElementNS('http://www.w3.org/2000/svg','path');
  bg.setAttribute('d', d);
  bg.setAttribute('stroke', '#ffffff');
  bg.setAttribute('stroke-width', '5');
  bg.setAttribute('fill', 'none');
  bg.setAttribute('stroke-linecap', 'round');
  bg.setAttribute('stroke-linejoin', 'round');
  bg.setAttribute('opacity', '0.06');
  svgEl.appendChild(bg);

  // Animated route line
  const line = document.createElementNS('http://www.w3.org/2000/svg','path');
  line.setAttribute('d', d);
  line.setAttribute('stroke', '#e63700');
  line.setAttribute('stroke-width', '3');
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke-linecap', 'round');
  line.setAttribute('stroke-linejoin', 'round');
  line.setAttribute('stroke-dasharray', len);
  line.setAttribute('stroke-dashoffset', len);
  line.style.animation = 'dash 1.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards';
  svgEl.appendChild(line);

  // Dashes overlay (dashed pattern on top)
  const dashes = document.createElementNS('http://www.w3.org/2000/svg','path');
  dashes.setAttribute('d', d);
  dashes.setAttribute('stroke', '#ff7a55');
  dashes.setAttribute('stroke-width', '1.5');
  dashes.setAttribute('fill', 'none');
  dashes.setAttribute('stroke-linecap', 'round');
  dashes.setAttribute('stroke-dasharray', '6 8');
  dashes.setAttribute('opacity', '0.6');
  dashes.setAttribute('stroke-dashoffset', len);
  dashes.style.animation = 'dash 1.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards';
  svgEl.appendChild(dashes);

  // Direction arrows at midpoints of longer segments
  for (let i = 2; i < pathNodes.length; i += 4) {
    const a = pathNodes[i-1], b = pathNodes[i];
    const segLen = Math.hypot(b.x-a.x, b.y-a.y);
    if (segLen < 15) continue;
    const mx = (a.x + b.x)/2, my = (a.y + b.y)/2;
    const angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    const arr = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    // Small triangle
    arr.setAttribute('points', '-4,-2.5 4,0 -4,2.5');
    arr.setAttribute('fill', '#e63700');
    arr.setAttribute('opacity', '0.8');
    arr.setAttribute('transform', `translate(${mx},${my}) rotate(${angle})`);
    arr.setAttribute('pointer-events','none');
    svgEl.appendChild(arr);
  }

  // Start & end endpoint markers drawn last so they're on top of path
  const startN = pathNodes[0];
  const endN   = pathNodes[pathNodes.length - 1];

  // Start pulse ring
  const startRing = document.createElementNS('http://www.w3.org/2000/svg','circle');
  startRing.setAttribute('cx', startN.x); startRing.setAttribute('cy', startN.y);
  startRing.setAttribute('r', 12);
  startRing.setAttribute('fill', '#4caf5018');
  startRing.setAttribute('stroke', '#4caf50');
  startRing.setAttribute('stroke-width', '1.5');
  svgEl.appendChild(startRing);

  // End pulse ring (animated)
  const endRing = document.createElementNS('http://www.w3.org/2000/svg','circle');
  endRing.setAttribute('cx', endN.x); endRing.setAttribute('cy', endN.y);
  endRing.setAttribute('r', 12);
  endRing.setAttribute('fill', '#e6370018');
  endRing.setAttribute('stroke', '#e63700');
  endRing.setAttribute('stroke-width', '1.5');
  endRing.style.animation = 'pulse 1.8s ease-in-out infinite';
  svgEl.appendChild(endRing);
}

function pathLength(nodes) {
  let l = 0;
  for (let i = 1; i < nodes.length; i++) {
    l += Math.hypot(nodes[i].x - nodes[i-1].x, nodes[i].y - nodes[i-1].y);
  }
  return Math.ceil(l) + 50;
}

/* ── Tooltip ── */
function showTooltip(e, loc) {
  tooltip.innerHTML = `<strong>${loc.name}</strong>${loc.desc ? `<br><span style="color:#7a7e8a;font-size:11px">${loc.desc}</span>` : ''}`;
  tooltip.classList.add('visible');
  moveTooltip(e);
}
function hideTooltip() { tooltip.classList.remove('visible'); }
function moveTooltip(e) {
  const area = document.getElementById('map-area').getBoundingClientRect();
  let tx = e.clientX - area.left + 12;
  let ty = e.clientY - area.top  + 12;
  if (tx + 200 > area.width)  tx -= 220;
  if (ty + 60  > area.height) ty -= 70;
  tooltip.style.left = tx + 'px';
  tooltip.style.top  = ty + 'px';
}
document.getElementById('map-area').addEventListener('mousemove', e => {
  if (tooltip.classList.contains('visible')) moveTooltip(e);
});

/* ════════════════════════════════════════════════════════
   INTERACTION — клик на точку всегда открывает попап
════════════════════════════════════════════════════════ */
function onNodeClick(id, svgX, svgY) {
  hideTooltip();
  showRoomPopup(id, svgX, svgY);
}

function buildRoute() {
  const f = document.getElementById('sel-from').value;
  const t = document.getElementById('sel-to').value;
  if (!f || !t || f === t) return;

  fromId = f; toId = t;

  const result = dijkstra(f, t);
  if (!result) {
    alert('Маршрут не найден — точки не связаны');
    return;
  }

  window._currentRoute = result.path;

  // Detect cross-floor route (any mezzanine node in path)
  const routeFloors = [...new Set(
    result.path.map(id => nodeById[id]?.floor ?? 1)
  )].filter(f => f !== undefined);
  const isCrossFloor = routeFloors.length > 1 || routeFloors[0] === 1.5;

  // Auto-switch to floor of destination
  const destNode = nodeById[toId];
  if (destNode?.floor && destNode.floor !== currentFloor) {
    setFloor(destNode.floor);
  }

  // Distance in approximate metres (1 SVG unit ≈ 0.12 m for an 800px wide 96m building)
  const PX_TO_M = 0.12;
  const metres  = Math.round(result.totalDist * PX_TO_M);
  const seconds = Math.round(metres / 1.2); // avg 1.2 m/s walk
  const mins    = Math.floor(seconds / 60);
  const secs    = seconds % 60;

  // Render result
  const meta = document.getElementById('route-meta');
  meta.innerHTML = `
    <div class="meta-item">
      <div class="meta-value">~${metres} м</div>
      <div class="meta-label">расстояние</div>
    </div>
    <div class="meta-item">
      <div class="meta-value">${mins > 0 ? mins+'м' : ''} ${secs}с</div>
      <div class="meta-label">время в пути</div>
    </div>
  `;

  // Steps — show only named locations in the path
  const namedStops = result.path
    .filter(id => !id.startsWith('_'))
    .map(id => nodeById[id]);

  const stepsEl = document.getElementById('steps-list');
  let prevFloor = null;
  stepsEl.innerHTML = namedStops.map((loc, i) => {
    const cls  = i === 0 ? 'is-start' : i === namedStops.length-1 ? 'is-end' : '';
    const hint = i === 0 ? 'Начало' : i === namedStops.length-1 ? 'Цель' : `Шаг ${i}`;
    // Floor transition badge
    const locFloor = loc.floor ?? 1;
    let floorBadge = '';
    if (prevFloor !== null && locFloor !== prevFloor) {
      const label = locFloor === 1.5 ? 'Подняться → Мезонин 1½' : `Перейти → Этаж ${locFloor}`;
      floorBadge = `<div style="display:flex;align-items:center;gap:6px;padding:6px 0 4px;font-size:11px;color:#e63700;font-weight:600;letter-spacing:0.3px">
        <div style="flex:1;height:1px;background:#e6370030"></div>
        ${label}
        <div style="flex:1;height:1px;background:#e6370030"></div>
      </div>`;
    }
    prevFloor = locFloor;
    const catColor = CATEGORIES[loc.cat]?.color || '#7a7e8a';
    const stepHtml = `
      <div class="step-item ${cls}">
        <div class="step-icon" style="
          color:${catColor};
          font-size:9px;
          font-weight:700;
          letter-spacing:0.4px;
          font-family:'Inter',sans-serif;
          background:${catColor}15;
          border:1px solid ${catColor}40;
          border-radius:3px;
          min-width:28px;
          text-align:center;
          padding:2px 4px;
          white-space:nowrap;
        ">${loc.icon}</div>
        <div class="step-info">
          <div class="step-name">${loc.name}</div>
          <div class="step-hint">${hint}</div>
        </div>
      </div>`;
    return floorBadge + stepHtml;
  }).join('');

  document.getElementById('route-result').classList.add('visible');

  renderNodes();
}

function clearRoute() {
  fromId = ''; toId = '';
  window._currentRoute = null;
  document.getElementById('sel-from').value = '';
  document.getElementById('sel-to').value   = '';
  document.getElementById('route-result').classList.remove('visible');
  renderNodes();
}

function swapPoints() {
  const f = document.getElementById('sel-from').value;
  const t = document.getElementById('sel-to').value;
  document.getElementById('sel-from').value = t;
  document.getElementById('sel-to').value   = f;
  fromId = t; toId = f;
  if (fromId && toId) buildRoute();
  else renderNodes();
}

function updateUI() {
  const f = fromId, t = toId;
  document.getElementById('btn-build').disabled = !f || !t || f === t;
}

const FLOOR_MAPS = {
  1:   { src: 'first_floor_with-labels_section.svg',      label: '1-й этаж',    svgW: 801, svgH: 337 },
  1.5: { src: 'first-half_floor_with-labels_section.svg', label: 'Мезонин 1½',  svgW: 537, svgH: 157 },
  2:   { src: null,                                        label: '2-й этаж' },
  3:   { src: null,                                        label: '3-й этаж' },
};

function setFloor(n) {
  currentFloor = n;
  const map = FLOOR_MAPS[n];

  document.getElementById('floor-label').textContent = map?.label ?? (n + '-й этаж');
  document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'));
  // Highlight the matching button by text
  document.querySelectorAll('.floor-btn').forEach(b => {
    if (parseFloat(b.textContent) === n || b.textContent.trim() === '1½' && n === 1.5) {
      b.classList.add('active');
    }
  });

  if (n === 1 || n === 1.5) {
    // Floors 1 and 1.5 always shown together on the combined canvas
    img.src = 'first_floor_with-labels_section.svg';
    img.style.filter = 'invert(1) brightness(0.25) sepia(0.15)';
    mezzImg.style.filter = 'invert(1) brightness(0.25) sepia(0.15)';
    mezzImg.style.display = 'block';
    applyScale();
  } else {
    mezzImg.style.display = 'none';
    img.style.filter = 'invert(1) brightness(0.07)';
    svgEl.innerHTML = `<text x="${SVGW/2}" y="${F1H/2}" text-anchor="middle" dominant-baseline="middle" font-size="16" fill="#3a3e46" font-family="Inter,sans-serif">Карта этажа в разработке</text>`;
  }
}

/* ════════════════════════════════════════════════════════
   INIT selects & category filter
════════════════════════════════════════════════════════ */
const CATEGORIES = {
  nav:     { label:'Навигация', color:'#7a7e8a' },
  service: { label:'Сервис',    color:'#5b8dd9' },
  exhibit: { label:'Выставки',  color:'#9b59b6' },
  hall:    { label:'Залы',      color:'#e67e22' },
  shop:    { label:'Магазин',   color:'#27ae60' },
  food:    { label:'Кафе',      color:'#e63700' },
};

let activeCats = new Set(Object.keys(CATEGORIES));

function initSelects() {
  const selFrom = document.getElementById('sel-from');
  const selTo   = document.getElementById('sel-to');

  [selFrom, selTo].forEach(sel => {
    sel.innerHTML = '<option value="">— выберите место —</option>';
    Object.entries(CATEGORIES).forEach(([cat, {label}]) => {
      const group = document.createElement('optgroup');
      group.label = label;
      LOCATIONS.filter(l => l.cat === cat && l.floor === 1).forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc.id;
        opt.textContent = loc.name;
        group.appendChild(opt);
      });
      sel.appendChild(group);
    });
    sel.addEventListener('change', () => {
      fromId = selFrom.value;
      toId   = selTo.value;
      window._currentRoute = null;
      document.getElementById('route-result').classList.remove('visible');
      renderNodes();
      updateUI();
      // Auto-build if both points selected
      if (fromId && toId && fromId !== toId) {
        setTimeout(buildRoute, 200);
      }
    });
  });
}

function initCategoryFilter() {
  const el = document.getElementById('cat-filter');
  Object.entries(CATEGORIES).forEach(([cat, {label, color}]) => {
    const chip = document.createElement('div');
    chip.className = 'cat-chip active';
    chip.textContent = label;
    chip.style.setProperty('--cat-color', color);
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      if (activeCats.has(cat)) activeCats.delete(cat);
      else activeCats.add(cat);
      renderNodes();
    });
    el.appendChild(chip);
  });
}

/* ── Drag-to-pan ── */
let isDragging = false, startX = 0, startY = 0, mapLeft = 0, mapTop = 0;
const mapArea = document.getElementById('map-area');

mapArea.addEventListener('mousedown', e => {
  // Close popup when clicking on empty map area
  if (!e.target.closest('g') && !e.target.closest('.room-popup')) {
    closePopup();
  }
  if (e.target.closest('g')) return;
  isDragging = true;
  startX = e.clientX; startY = e.clientY;
  const s = wrap.style.transform.match(/translate\((.+)px,\s*(.+)px\)/);
  mapLeft = s ? parseFloat(s[1]) : 0;
  mapTop  = s ? parseFloat(s[2]) : 0;
  mapArea.style.cursor = 'grabbing';
});
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - startX, dy = e.clientY - startY;
  wrap.style.transform = `translate(${mapLeft+dx}px,${mapTop+dy}px)`;
});
window.addEventListener('mouseup', () => {
  isDragging = false;
  mapArea.style.cursor = '';
});

// Wheel zoom
mapArea.addEventListener('wheel', e => {
  e.preventDefault();
  zoom(e.deltaY < 0 ? 1.12 : 0.89);
}, { passive: false });

/* ════════════════════════════════════════════════════════
   SCHEDULE RENDERING
════════════════════════════════════════════════════════ */

// Rooms that appear in the schedule panel (in display order)
const SCHEDULE_ROOMS = [
  'lecture', 'cinema', 'main_hall', 'hall_a', 'hall_b', 'hall_c', 'hall_d',
  'bookshop', 'cafe',
];

function renderSchedule() {
  const container = document.getElementById('schedule-panel');
  container.innerHTML = '';

  SCHEDULE_ROOMS.forEach(roomId => {
    const evs = MOCK_EVENTS[roomId];
    if (!evs) return;
    const loc = LOCATIONS.find(l => l.id === roomId);
    if (!loc) return;

    const hasLive = evs.some(e => eventStatus(e) === 'now');

    const roomEl = document.createElement('div');
    roomEl.className = 'room-schedule';

    // Header
    const header = document.createElement('div');
    header.className = 'room-schedule-header';
    const catColor = CATEGORIES[loc.cat]?.color || '#7a7e8a';
    header.innerHTML = `
      <span class="room-icon" style="
        color:${catColor};
        font-weight:700;
        font-size:10px;
        letter-spacing:0.5px;
        min-width:36px;
        background:${catColor}15;
        border:1px solid ${catColor}40;
        border-radius:3px;
        padding:2px 5px;
        text-align:center;
        font-family:'Inter',sans-serif;
      ">${loc.icon}</span>
      <span class="room-name">${loc.name}</span>
      ${hasLive ? '<span class="live-badge">сейчас</span>' : ''}
    `;
    header.addEventListener('click', () => showRoomPopup(roomId));
    roomEl.appendChild(header);

    // Events list
    const list = document.createElement('div');
    list.className = 'events-list';

    evs.forEach(ev => {
      const status = eventStatus(ev);
      const typeInfo = EVENT_TYPES[ev.type] || { label: ev.type, color: '#7a7e8a' };

      const row = document.createElement('div');
      row.className = `event-row ${status}`;

      const speakerHtml = ev.speaker
        ? `<span style="color:#5a6070">·</span> ${ev.speaker}`
        : '';

      row.innerHTML = `
        ${status === 'now' ? '<div class="now-dot"></div>' : '<div style="width:6px;flex-shrink:0"></div>'}
        <div class="event-time">${ev.time}</div>
        <div class="event-body">
          <div class="event-title">${ev.title}</div>
          <div class="event-meta">
            <span class="event-type-chip" style="background:${typeInfo.color}22;color:${typeInfo.color}">${typeInfo.label}</span>
            ${ev.end ? `<span style="color:#4a4e5a">${ev.time}–${ev.end}</span>` : ''}
            ${speakerHtml}
          </div>
        </div>
      `;
      list.appendChild(row);
    });

    roomEl.appendChild(list);
    container.appendChild(roomEl);
  });
}

// Update clock display
function updateClock() {
  const el = document.getElementById('current-time-display');
  if (el) el.textContent = nowStr();
}

/* ════════════════════════════════════════════════════════
   ROOM POPUP
════════════════════════════════════════════════════════ */

let _popupRoomId = null;

function showRoomPopup(roomId, svgX, svgY) {
  const loc = LOCATIONS.find(l => l.id === roomId);
  if (!loc) return;
  _popupRoomId = roomId;
  const status = getRoomStatus(roomId);
  const popup  = document.getElementById('room-popup');

  /* ── Header ── */
  const catClr = CATEGORIES[loc.cat]?.color || '#7a7e8a';
  const popupIconEl = document.getElementById('popup-icon');
  popupIconEl.textContent = loc.icon;
  popupIconEl.style.cssText = `
    color:${catClr};
    font-weight:700;
    font-size:11px;
    letter-spacing:0.6px;
    font-family:'Inter',sans-serif;
    background:${catClr}18;
    border:1px solid ${catClr}45;
    border-radius:4px;
    padding:3px 8px;
  `;
  document.getElementById('popup-name').textContent = loc.name;

  /* ── Body ── */
  const body = document.getElementById('popup-body');
  let html = '';

  if (status?.now) {
    const t = EVENT_TYPES[status.now.type] || { label: status.now.type, color:'#e63700' };
    html += `
      <div class="popup-event-now">
        <div class="popup-event-label">— СЕЙЧАС</div>
        <div class="popup-event-title">${status.now.title}</div>
        <div class="popup-event-time" style="margin-top:3px">
          ${status.now.time}–${status.now.end}
          ${status.now.speaker ? `<span style="color:#4a5060"> · ${status.now.speaker}</span>` : ''}
        </div>
        ${status.now.desc ? `<div style="font-size:11.5px;color:#5a6272;margin-top:6px;line-height:1.4">${status.now.desc}</div>` : ''}
      </div>`;
  }

  if (status?.next) {
    const t = EVENT_TYPES[status.next.type] || { label: status.next.type, color:'#7a7e8a' };
    html += `
      <div class="popup-next" style="margin-top:${status?.now ? '8px':'0'}">
        <span style="color:#4a5060;font-size:11px">Далее</span>
        <span style="font-size:12px;font-weight:600;color:#c0c4cc;margin-left:4px">${status.next.time}</span>
        <span style="font-size:12px;color:#9ba3b8;margin-left:4px">${status.next.title}</span>
        <span class="event-type-chip" style="background:${t.color}20;color:${t.color};margin-left:6px;font-size:10px;padding:1px 6px;border-radius:4px">${t.label}</span>
      </div>`;
  }

  if (!status?.now && !status?.next) {
    const evs = MOCK_EVENTS[roomId];
    if (evs?.length) {
      const next = evs.find(e => eventStatus(e) === 'upcoming');
      if (next) {
        const t = EVENT_TYPES[next.type] || { label: next.type, color:'#7a7e8a' };
        html += `
          <div style="font-size:12.5px;color:var(--text-dim);padding:6px 0">
            Мероприятий сейчас нет
          </div>
          <div class="popup-next">
            <span style="color:#4a5060;font-size:11px">Ближайшее</span>
            <span style="font-size:12px;font-weight:600;color:#c0c4cc;margin-left:4px">${next.time}</span>
            <span style="font-size:12px;color:#9ba3b8;margin-left:4px">${next.title}</span>
          </div>`;
      } else {
        html += `<div style="font-size:12.5px;color:var(--text-muted);padding:8px 0">На сегодня мероприятий нет</div>`;
      }
    } else {
      if (loc.desc) html += `<div style="font-size:12.5px;color:var(--text-dim);padding:6px 0">${loc.desc}</div>`;
    }
  }

  body.innerHTML = html;

  /* ── Buttons ── */
  const fromBtn = document.getElementById('popup-from-btn');
  const toBtn   = document.getElementById('popup-to-btn');

  // Style "from" btn to show if already selected
  const isFrom = fromId === roomId;
  fromBtn.style.background    = isFrom ? '#4caf5022' : 'var(--surface2)';
  fromBtn.style.borderColor   = isFrom ? '#4caf50'   : 'var(--border)';
  fromBtn.style.color         = isFrom ? '#4caf50'   : 'var(--text-dim)';
  fromBtn.textContent         = isFrom ? '✓ Начало выбрано' : 'Отметить начало';

  fromBtn.onclick = () => {
    fromId = roomId;
    document.getElementById('sel-from').value = roomId;
    // If we already have a destination — build immediately
    if (toId && toId !== fromId) {
      closePopup();
      switchTab('nav');
      buildRoute();
    } else {
      closePopup();
      switchTab('nav');
      renderNodes();
      updateUI();
    }
  };

  toBtn.textContent = fromId && fromId !== roomId
    ? 'Проложить маршрут сюда'
    : 'Выбрать как пункт назначения';

  toBtn.onclick = () => {
    toId = roomId;
    document.getElementById('sel-to').value = roomId;
    closePopup();
    switchTab('nav');
    if (fromId && fromId !== toId) {
      buildRoute();
    } else {
      renderNodes();
      updateUI();
    }
  };

  /* ── Positioning near the node ── */
  popup.classList.remove('arrow-top', 'arrow-bottom');
  popup.classList.add('visible');

  // Convert SVG coords → screen coords relative to map-area
  const nodeX  = svgX ?? loc.x;
  const nodeY  = svgY ?? loc.y;
  const areaEl = document.getElementById('map-area');
  const wrapEl = document.getElementById('map-wrap');
  const areaR  = areaEl.getBoundingClientRect();
  const wrapR  = wrapEl.getBoundingClientRect();

  const screenX = (wrapR.left - areaR.left) + nodeX * scale;
  const screenY = (wrapR.top  - areaR.top)  + nodeY * scale;

  const PW = 300, PH = popup.offsetHeight || 220;
  const GAP = 14;

  let left = screenX + GAP;
  let top  = screenY - PH / 2;

  // Flip left if not enough space on right
  if (left + PW > areaR.width - 10) {
    left = screenX - PW - GAP;
  }
  // Keep vertically within bounds
  top = Math.max(10, Math.min(top, areaR.height - PH - 10));

  popup.style.left = left + 'px';
  popup.style.top  = top  + 'px';
}

function closePopup() {
  document.getElementById('room-popup').classList.remove('visible');
  _popupRoomId = null;
}

/* ════════════════════════════════════════════════════════
   TABS
════════════════════════════════════════════════════════ */

function switchTab(tab) {
  document.getElementById('panel-nav').style.display   = tab === 'nav'   ? '' : 'none';
  document.getElementById('panel-sched').style.display = tab === 'sched' ? '' : 'none';
  document.getElementById('panel-qr').style.display    = tab === 'qr'    ? '' : 'none';
  document.getElementById('tab-nav').classList.toggle('active',   tab === 'nav');
  document.getElementById('tab-sched').classList.toggle('active', tab === 'sched');
  document.getElementById('tab-qr').classList.toggle('active',    tab === 'qr');
  if (tab === 'sched') { renderSchedule(); updateClock(); }
  if (tab === 'qr')    { renderQRPanel(); }
}

/* ════════════════════════════════════════════════════════
   LIVE dot overlay — добавляется поверх узлов после рендера
════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════
   TOOLTIP UPDATE — show current event
════════════════════════════════════════════════════════ */

const _origShowTooltip = showTooltip;
showTooltip = function(e, loc) {
  const status = getRoomStatus(loc.id);
  let extra = '';
  if (status?.now) {
    extra = `<div style="margin-top:5px;padding-top:5px;border-top:1px solid #2e3138">
      <span style="color:#e63700;font-size:10px;font-weight:700;letter-spacing:.5px">СЕЙЧАС</span>
      <span style="font-size:11px;margin-left:4px">${status.now.title}</span>
    </div>`;
  } else if (status?.next) {
    extra = `<div style="margin-top:5px;padding-top:5px;border-top:1px solid #2e3138;font-size:11px;color:#5a6070">
      Далее в ${status.next.time}: ${status.next.title}
    </div>`;
  }
  tooltip.innerHTML = `<strong>${loc.name}</strong>${loc.desc ? `<br><span style="color:#7a7e8a;font-size:11px">${loc.desc}</span>` : ''}${extra}`;
  tooltip.classList.add('visible');
  moveTooltip(e);
};

/* ════════════════════════════════════════════════════════
   LIVE INDICATOR on map nodes
════════════════════════════════════════════════════════ */

// Patch renderNodes to add live dot + open popup on second click
const _baseRenderNodes = renderNodes;
renderNodes = function() {
  _baseRenderNodes();

  // After nodes are rendered, add live dots for rooms with active events
  LOCATIONS.forEach(loc => {
    if (loc.floor !== currentFloor) return;
    if (!activeCats.has(loc.cat)) return;
    const status = getRoomStatus(loc.id);
    if (!status?.now) return;

    // Find the group by scanning childNodes (since we can't use getElementById on SVG group)
    // Instead, add a small live dot overlay
    const dot = document.createElementNS('http://www.w3.org/2000/svg','circle');
    dot.setAttribute('cx', loc.x + 14);
    dot.setAttribute('cy', loc.y - 8);
    dot.setAttribute('r', 3.5);
    dot.setAttribute('fill', '#e63700');
    dot.setAttribute('stroke', '#111214');
    dot.setAttribute('stroke-width', '1.5');
    dot.style.animation = 'livePulse 1.5s ease-in-out infinite';
    dot.setAttribute('pointer-events', 'none');
    svgEl.appendChild(dot);
  });

  // "ВЫ ЗДЕСЬ" marker on top of everything
  if (youAreHereId) renderYouAreHere();
};

/* ════════════════════════════════════════════════════════
   QR-МЕТКИ
════════════════════════════════════════════════════════ */

function renderQRPanel() {
  const grid = document.getElementById('qr-grid');
  if (grid.childElementCount > 0) return; // already rendered

  const baseUrl = window.location.origin + window.location.pathname;

  LOCATIONS.forEach(loc => {
    const url      = `${baseUrl}?from=${loc.id}`;
    const catColor = CATEGORIES[loc.cat]?.color || '#7a7e8a';

    const card = document.createElement('div');
    card.className = 'qr-card';
    card.title = loc.name;
    card.onclick = () => window.open(url, '_blank');

    // Tag chip
    const tag = document.createElement('div');
    tag.className = 'qr-card-tag';
    tag.textContent = loc.icon;
    tag.style.cssText = `background:${catColor}20;color:${catColor};border:1px solid ${catColor}40;`;
    card.appendChild(tag);

    // QR canvas — generated locally, no network needed
    const qrWrap = document.createElement('div');
    qrWrap.style.cssText = 'border-radius:6px;overflow:hidden;line-height:0;';
    card.appendChild(qrWrap);

    // QRCode lib generates a canvas inside qrWrap
    new QRCode(qrWrap, {
      text:          url,
      width:         110,
      height:        110,
      colorDark:     '#d4d4d4',
      colorLight:    '#16181f',
      correctLevel:  QRCode.CorrectLevel.M,
    });

    // Name
    const name = document.createElement('div');
    name.className = 'qr-card-name';
    name.textContent = loc.name;
    card.appendChild(name);

    // URL hint
    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:9px;color:#3a3e48;text-align:center;';
    hint.textContent = `?from=${loc.id}`;
    card.appendChild(hint);

    grid.appendChild(card);
  });
}

/* ════════════════════════════════════════════════════════
   YOU-ARE-HERE  (активируется по ?from= в URL)
════════════════════════════════════════════════════════ */

let youAreHereId = null; // id локации из QR-кода

function initFromURL() {
  const params = new URLSearchParams(window.location.search);
  const fromParam = params.get('from');
  if (!fromParam) return;

  const loc = LOCATIONS.find(l => l.id === fromParam);
  if (!loc) return;

  youAreHereId = fromParam;
  fromId       = fromParam;

  // Sync select
  document.getElementById('sel-from').value = fromParam;

  // Show banner
  document.getElementById('yah-name').textContent = loc.name;
  document.getElementById('yah-banner').classList.add('visible');

  updateUI();
}

/* Рисует специальный маркер "ВЫ ЗДЕСЬ" поверх обычных нод */
function renderYouAreHere() {
  const loc = LOCATIONS.find(l => l.id === youAreHereId);
  if (!loc) return;

  const g = document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('transform', `translate(${loc.x},${loc.y})`);
  g.style.pointerEvents = 'none';

  // Outer pulsing ring
  const ring = document.createElementNS('http://www.w3.org/2000/svg','circle');
  ring.setAttribute('r', 20);
  ring.setAttribute('fill', '#e6370012');
  ring.setAttribute('stroke', '#e63700');
  ring.setAttribute('stroke-width', '1');
  ring.setAttribute('class', 'you-are-here-ring');
  g.appendChild(ring);

  // Middle ring
  const ring2 = document.createElementNS('http://www.w3.org/2000/svg','circle');
  ring2.setAttribute('r', 13);
  ring2.setAttribute('fill', '#e6370025');
  ring2.setAttribute('stroke', '#e63700');
  ring2.setAttribute('stroke-width', '1.5');
  g.appendChild(ring2);

  // Center dot
  const dot = document.createElementNS('http://www.w3.org/2000/svg','circle');
  dot.setAttribute('r', 5);
  dot.setAttribute('fill', '#e63700');
  g.appendChild(dot);

  // "ВЫ ЗДЕСЬ" label above
  const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('x', -22); bg.setAttribute('y', -33);
  bg.setAttribute('width', 44); bg.setAttribute('height', 11);
  bg.setAttribute('rx', 2);
  bg.setAttribute('fill', '#e63700');
  g.appendChild(bg);

  const lbl = document.createElementNS('http://www.w3.org/2000/svg','text');
  lbl.setAttribute('text-anchor', 'middle');
  lbl.setAttribute('y', -25);
  lbl.setAttribute('font-size', '6');
  lbl.setAttribute('font-weight', '700');
  lbl.setAttribute('letter-spacing', '0.6');
  lbl.setAttribute('font-family', 'Inter, sans-serif');
  lbl.setAttribute('fill', '#fff');
  lbl.textContent = 'ВЫ ЗДЕСЬ';
  g.appendChild(lbl);

  // Connector line from label to dot
  const line = document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('x1', 0); line.setAttribute('y1', -22);
  line.setAttribute('x2', 0); line.setAttribute('y2', -6);
  line.setAttribute('stroke', '#e63700');
  line.setAttribute('stroke-width', '1');
  g.appendChild(line);

  svgEl.appendChild(g);
}

/* ── Boot ── */
window.addEventListener('load', () => {
  initScale();
  initSelects();
  initCategoryFilter();
  initFromURL();   // читаем ?from= из QR-кода
  renderNodes();   // перерисовываем с youAreHereId уже установленным
  updateUI();
  renderSchedule();
  updateClock();
  // Refresh clock every minute
  setInterval(() => {
    updateClock();
    if (document.getElementById('panel-sched').style.display !== 'none') {
      renderSchedule();
    }
    renderNodes(); // refresh live dots
  }, 60_000);
  window.addEventListener('resize', () => { initScale(); });
});
