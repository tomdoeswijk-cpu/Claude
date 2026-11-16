'use strict';
/* Ελληνικά: persoonlijke leer-app. Alle voortgang staat lokaal op het toestel (localStorage). */

// ---------- hulpfuncties ----------
const $ = (s, r = document) => r.querySelector(s);
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
/** Kinderen toevoegen of vervangen; lege waarden en geneste lijsten worden netjes afgehandeld. */
const kidsOf = k => k.flat(Infinity).filter(c => c != null && c !== false).map(c => c.nodeType ? c : document.createTextNode(String(c)));
const put = (el, ...k) => el.append(...kidsOf(k));
const fill = (el, ...k) => el.replaceChildren(...kidsOf(k));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
const sample = (a, n) => shuffle(a).slice(0, n);
const DAY = 864e5;
const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / DAY);
const stripMarks = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = s => stripMarks(s.toLowerCase()).replace(/ς/g, 'σ').replace(/[.,;!?·:"]/g, ' ').replace(/\s+/g, ' ').trim();
function similarity(a, b) {
  if (!a.length || !b.length) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return 1 - prev[b.length] / Math.max(a.length, b.length);
}

/** Uitspraakhulp: zet Grieks om naar een Nederlandse benadering van de klank. */
function translit(src) {
  const s = src.toLowerCase();
  const V = { α: 'a', ε: 'e', η: 'i', ι: 'i', ο: 'o', υ: 'i', ω: 'o' };
  const ACC = { ά: 'α', έ: 'ε', ή: 'η', ί: 'ι', ό: 'ο', ύ: 'υ', ώ: 'ω', ΐ: 'ι', ΰ: 'υ' };
  const DIA = { ϊ: 'ι', ϋ: 'υ' };
  const C = { β: 'v', γ: 'gh', δ: 'dh', ζ: 'z', θ: 'th', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'ks', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', φ: 'f', χ: 'ch', ψ: 'ps' };
  const acute = { a: 'á', e: 'é', i: 'í', o: 'ó', oe: 'oé' };
  const base = ch => ACC[ch] || DIA[ch] || ch;
  const isLetter = ch => !!ch && (V[base(ch)] !== undefined || C[ch] !== undefined);
  const front = i => { const a = base(s[i] || ''), n = s[i + 1] || ''; return !!a && ('εηιυ'.includes(a) || ((a === 'α' || a === 'ο') && (n === 'ι' || n === 'ί') && !ACC[s[i]])); };
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i], n = s[i + 1] || '', bn = base(n);
    const start = !isLetter(s[i - 1]);
    if (V[c] !== undefined && n && !DIA[n] && n !== 'ΐ' && n !== 'ΰ') {
      const stressed = !!ACC[n]; let r = null;
      if (c === 'ο' && bn === 'υ') r = 'oe';
      else if (c === 'α' && bn === 'ι') r = 'e';
      else if ((c === 'ε' || c === 'ο' || c === 'υ') && bn === 'ι') r = 'i';
      else if ((c === 'α' || c === 'ε') && bn === 'υ') {
        const nx = s[i + 2] || '';
        const voiceless = !isLetter(nx) || 'θκξπσςτφχψ'.includes(nx);
        out += (stressed ? acute[V[c]] : V[c]) + (voiceless ? 'f' : 'v'); i++; continue;
      }
      if (r) { out += stressed ? acute[r] : r; i++; continue; }
    }
    if (V[base(c)] !== undefined) { const v = V[base(c)]; out += ACC[c] ? acute[v] : v; continue; }
    if (c === 'μ' && n === 'π') { out += start ? 'b' : 'mb'; i++; continue; }
    if (c === 'ν' && n === 'τ') { out += start ? 'd' : 'nd'; i++; continue; }
    if (c === 'γ' && n === 'κ') { out += start ? 'g' : 'ng'; i++; continue; }
    if (c === 'γ' && n === 'γ') { out += 'ng'; i++; continue; }
    if (c === 'τ' && (n === 'σ' || n === 'ς')) { out += 'ts'; i++; continue; }
    if (c === 'τ' && n === 'ζ') { out += 'dz'; i++; continue; }
    if (c === 'γ' && n === 'ι' && V[base(s[i + 2] || '')] !== undefined) { out += 'j'; i++; continue; }
    if (c === 'γ') { out += front(i + 1) ? 'j' : 'gh'; continue; }
    if (C[c]) { if (n === c) continue; out += C[c]; continue; }
    out += c;
  }
  return out;
}

// ---------- opslag ----------
const KEY = 'ellinika.v1';
const defaults = () => ({ v: 1, items: {}, done: {}, tests: {}, start: null, settings: { audio: true, speak: true, translit: true, rate: 0.85 } });
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v === 1) { const d = defaults(); return Object.assign(d, s, { settings: Object.assign(d.settings, s.settings) }); }
  } catch (e) { /* lege of onleesbare opslag: begin opnieuw */ }
  return defaults();
}
let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* opslag niet beschikbaar */ } }

// ---------- cursus opbouwen ----------
const ITEMS = {}, NODES = [], SECTIONS = [], BYTRACK = { alpha: [], num: [], word: [] };
const ART = new Set(['ο', 'η', 'το', 'οι', 'τα']);
(function build() {
  const add = it => { if (!ITEMS[it.id]) { ITEMS[it.id] = it; BYTRACK[it.track].push(it); } return it.id; };
  const section = s => { s.nodes = []; SECTIONS.push(s); };
  const node = n => { n.idx = NODES.length; n.sec = SECTIONS.length - 1; NODES.push(n); SECTIONS[n.sec].nodes.push(n.idx); };

  section({ title: 'Het alfabet', level: 'A1' });
  ALPHA.forEach(a => add({ id: 'l:' + a[1], track: 'alpha', el: a[0], nl: a[3], name: a[2], hint: a[4], ex: a[5], exnl: a[6], say: a[5], unit: -1, level: 'A1' }));
  ALPHA_LESSONS.forEach((l, i) => node({ id: 'a' + (i + 1), kind: 'lesson', track: 'alpha', title: l.title, sub: l.sub, items: l.letters.map(x => 'l:' + x), read: l.read, cognates: l.cognates, tip: l.tip }));
  node({ id: 'at', kind: 'test', track: 'alpha', title: 'Toets: alfabet', sub: 'Kun je al lezen? Sla hiermee de alfabetlessen over', items: ALPHA.map(a => 'l:' + a[1]) });

  const numSection = i => {
    const l = NUM_LESSONS[i];
    section({ title: l.title, level: 'A1' });
    node({ id: 'n' + (i + 1), kind: 'lesson', track: 'num', title: l.title, sub: 'Tellen en verstaan', range: l.range, tip: l.tip,
      items: l.nums.map(n => add({ id: 'n:' + n, track: 'num', el: elNum(n), nl: String(n), say: elNum(n), unit: -1, level: 'A1' })) });
  };
  const NUM_AFTER = { 1: 0, 3: 1, 6: 2, 10: 3 }; // na welk thema (index) een getallenles volgt

  UNITS.forEach((u, ui) => {
    section({ title: u.title, level: u.level, unit: ui });
    u.ids = u.words.map(w => add({ id: 'w:' + w.el, track: 'word', el: w.el, nl: w.nl, say: w.el, unit: ui, level: u.level }));
    const n = Math.ceil(u.ids.length / 7), baseSize = Math.floor(u.ids.length / n), extra = u.ids.length % n;
    let pos = 0;
    for (let k = 0; k < n; k++) {
      const size = baseSize + (k < extra ? 1 : 0);
      node({ id: `u${ui + 1}l${k + 1}`, kind: 'lesson', track: 'word', title: u.title, sub: `Les ${k + 1} van ${n}`, unit: ui,
        items: u.ids.slice(pos, pos + size), sents: u.sents.filter((s, si) => si % n === k), tip: k === 0 ? u.tip : null });
      pos += size;
    }
    node({ id: `u${ui + 1}t`, kind: 'test', track: 'word', title: 'Toets: ' + u.title, sub: 'Peilmoment over dit thema', items: u.ids, sents: u.sents, unit: ui });
    if (ui in NUM_AFTER) numSection(NUM_AFTER[ui]);
    if (ui === UNITS.length - 1 || UNITS[ui + 1].level !== u.level) {
      const us = UNITS.filter(x => x.level === u.level);
      section({ title: 'Niveautoets ' + u.level, level: u.level });
      node({ id: 't' + u.level, kind: 'test', big: true, track: 'word', title: 'Niveautoets ' + u.level, sub: `Alles van ${u.level} door elkaar`, level: u.level,
        items: us.flatMap(x => x.ids), sents: us.flatMap(x => x.sents) });
    }
  });
})();

const isDone = id => !!S.done[id];
const currentNode = () => NODES.find(n => !isDone(n.id));
function unlocked(n) {
  if (n.idx === 0 || isDone(n.id) || isDone(NODES[n.idx - 1].id)) return true;
  if (n.kind === 'test' && !n.big) { const first = NODES[SECTIONS[n.sec].nodes[0]]; return first.idx === 0 || isDone(NODES[first.idx - 1].id); }
  return false;
}

// ---------- gespreide herhaling ----------
// Elk item zit in een bak (0-7). Goed: een bak omhoog en langer wachten. Fout: twee bakken terug en morgen opnieuw.
const INTERVAL = [0, 1, 3, 7, 14, 30, 60, 120];
function grade(id, ok) {
  const t = today();
  const it = S.items[id] || (S.items[id] = { b: 0, d: t });
  if (ok) { it.b = Math.min(7, it.b + 1); it.d = t + INTERVAL[it.b]; }
  else { it.b = Math.max(1, it.b - 2); it.d = t + 1; }
}
const dueIds = () => Object.keys(S.items).filter(id => ITEMS[id] && S.items[id].d <= today()).sort((a, b) => S.items[a].d - S.items[b].d);
function stats(track, level) {
  const its = BYTRACK[track].filter(x => !level || x.level === level);
  let seen = 0, known = 0, solid = 0;
  its.forEach(x => { const s = S.items[x.id]; if (s) { seen++; if (s.b >= 3) known++; if (s.b >= 5) solid++; } });
  return { total: its.length, seen, known, solid };
}

// ---------- geluid en spraak ----------
let elVoice = null;
const hasTTS = 'speechSynthesis' in window;
function loadVoices() { const vs = speechSynthesis.getVoices(); elVoice = vs.find(v => /^el/i.test(v.lang)) || null; }
if (hasTTS) { loadVoices(); speechSynthesis.addEventListener('voiceschanged', loadVoices); }
const audioOn = () => S.settings.audio && hasTTS;
function say(text, rate) {
  if (!audioOn() || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'el-GR'; if (elVoice) u.voice = elVoice;
  u.rate = rate || S.settings.rate;
  speechSynthesis.speak(u);
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const speakOn = () => S.settings.speak;

const ICON_SPK = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
const ICON_MIC = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11h-2z"/></svg>';
const speaker = (text, big) => h('button', { class: 'spk' + (big ? ' big' : ''), 'aria-label': 'Luister', html: ICON_SPK, onclick: () => say(text) });

// ---------- oefeningen samenstellen ----------
const tokens = s => s.split(/\s+/).map(t => t.replace(/[.,;!?·:]/g, '')).filter(Boolean);
const PROPER = /^(Ελλ|Ολλανδ|Έλλην|Δευτέρ|Τρίτη|Τετάρτ|Πέμπτ|Παρασκευ|Σάββατ|Σαββατοκ|Κυριακ|Μαρία|Νίκο|Αθήνα|Ακρόπολ|Μάιο|Αύγουστ|Nederland|Griek|Athene|Maria|Nikos|Akropolis)/;
function sentTokens(s) { const t = tokens(s); if (t.length && !PROPER.test(t[0])) t[0] = t[0].toLowerCase(); return t; }
function spellParts(el) {
  const t = el.split(' ');
  let p = null;
  if (t.length === 1) p = { pre: '', w: el };
  else if (t.length === 2 && ART.has(t[0])) p = { pre: t[0] + ' ', w: t[1] };
  if (!p || p.w.length < 2 || p.w.length > 11 || /[;']/.test(p.w)) return null;
  return p;
}
const hasArticle = x => x.el.includes(' ') && ART.has(x.el.split(' ')[0]);
function distractors(it, n, field) {
  let pool = BYTRACK[it.track].filter(x => x.id !== it.id && x.nl !== it.nl && x.el !== it.el);
  if (it.track === 'word') {
    const like = pool.filter(x => hasArticle(x) === hasArticle(it));
    const near = like.filter(x => x.unit === it.unit), far = like.filter(x => x.unit !== it.unit && x.unit <= it.unit + 1);
    pool = shuffle(near).concat(shuffle(far), shuffle(pool));
  } else pool = shuffle(pool);
  const seen = new Set([it[field]]), out = [];
  for (const x of pool) { if (out.length >= n) break; if (!seen.has(x[field])) { seen.add(x[field]); out.push(x); } }
  return out;
}
const mc = (it, mode) => ({ t: 'mc', id: it.id, mode });
const spellOr = (it, fallback) => spellParts(it.el) && it.track === 'word' ? { t: 'spell', id: it.id } : mc(it, fallback || 'nl-el');
function matchEx(its) {
  const seen = new Set(), ids = [];
  for (const x of shuffle(its)) { if (ids.length < 5 && !seen.has(x.nl)) { seen.add(x.nl); ids.push(x.id); } }
  return ids.length >= 3 ? { t: 'match', ids } : null;
}
const randNum = r => r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1));
function numEx(n, mode) { return { t: 'num', n, mode: mode === 'tiles' && !elNum(n).includes(' ') ? 'read' : mode }; }

function buildLesson(node) {
  const its = node.items.map(id => ITEMS[id]);
  const q = [];
  if (node.tip) q.push({ t: 'tip', title: node.title, text: node.tip });
  for (let i = 0; i < its.length; i += 3) {
    const g = its.slice(i, i + 3);
    g.forEach(x => q.push({ t: 'intro', id: x.id }));
    shuffle(g).forEach(x => q.push(mc(x, 'el-nl')));
  }
  q.push(matchEx(its));
  if (node.track === 'alpha') {
    shuffle(its).forEach(x => q.push(mc(x, 'nl-el')));
    const words = sample(node.read, 8);
    words.forEach((w, i) => q.push({ t: 'read', word: w, pool: node.read, mode: ['w-t', 'listen', 't-w'][i % 3] }));
    if (node.cognates) sample(node.cognates, 6).forEach(p => q.push({ t: 'cog', pair: p, pool: node.cognates }));
    q.push({ t: 'speak', el: pick(node.read) });
    sample(its, 4).forEach(x => q.push(mc(x, 'el-nl')));
  } else if (node.track === 'num') {
    shuffle(its).forEach((x, i) => q.push(i % 2 ? mc(x, 'nl-el') : mc(x, 'listen')));
    sample(its, 6).forEach(x => q.push(numEx(+x.nl, 'listen')));
    if (node.range) for (let i = 0; i < 6; i++) q.push(numEx(randNum(node.range), ['tiles', 'listen', 'read'][i % 3]));
    q.push({ t: 'speak', el: pick(its).el, nl: null });
  } else {
    shuffle(its).forEach((x, i) => q.push(i % 3 === 0 ? mc(x, 'listen') : i % 3 === 1 ? mc(x, 'nl-el') : spellOr(x)));
    node.sents.forEach((s, i) => q.push({ t: 'build', s, mode: ['nl-el', 'listen', 'el-nl'][(i + node.idx) % 3] }));
    const w = pick(its); q.push({ t: 'speak', el: w.el, nl: w.nl, id: w.id });
    if (node.sents.length) { const s = pick(node.sents); q.push({ t: 'speak', el: s.el, nl: s.nl }); }
    sample(its, 3).forEach(x => q.push(spellOr(x, 'listen')));
    if (its.length > 5) q.push(matchEx(its));
  }
  return q.filter(Boolean);
}

function buildTest(node) {
  const its = node.items.map(id => ITEMS[id]);
  let q = [];
  if (node.track === 'alpha') {
    sample(its, 8).forEach((x, i) => q.push(mc(x, i % 2 ? 'nl-el' : 'el-nl')));
    const pool = ALPHA_LESSONS.flatMap(l => l.read);
    sample(pool, 8).forEach((w, i) => q.push({ t: 'read', word: w, pool, mode: ['w-t', 't-w', 'listen'][i % 3] }));
  } else {
    const nS = node.big ? 6 : 3, nW = node.big ? 24 : 11;
    sample(its, nW).forEach((x, i) => q.push([mc(x, 'nl-el'), mc(x, 'listen'), spellOr(x), mc(x, 'el-nl')][i % 4]));
    sample(node.sents, nS).forEach((s, i) => q.push({ t: 'build', s, mode: ['nl-el', 'listen', 'el-nl'][i % 3] }));
  }
  return shuffle(q);
}

function reviewEx(it) {
  const b = (S.items[it.id] || { b: 1 }).b;
  if (it.track === 'alpha') return mc(it, pick(['el-nl', 'nl-el']));
  if (it.track === 'num') return pick([numEx(+it.nl, 'listen'), mc(it, 'el-nl'), mc(it, 'nl-el')]);
  if (b <= 2) return mc(it, pick(['el-nl', 'nl-el', 'listen']));
  if (b <= 4) return pick([spellOr(it), mc(it, 'listen'), mc(it, 'nl-el')]);
  return pick([spellOr(it), spellOr(it), mc(it, 'nl-el'), { t: 'speak', el: it.el, nl: it.nl, id: it.id }]);
}
function buildReview(ids) {
  const its = ids.map(id => ITEMS[id]);
  const q = its.map(reviewEx);
  const words = its.filter(x => x.track === 'word');
  if (words.length >= 5) q.unshift(matchEx(words));
  // doorweven met zinnen uit thema's die al af zijn
  const doneUnits = UNITS.filter((u, i) => isDone(`u${i + 1}l1`));
  if (doneUnits.length && words.length >= 4) {
    sample(doneUnits.flatMap(u => u.sents), 3).forEach((s, i) => q.splice(Math.min(q.length, 3 + i * 4), 0, { t: 'build', s, mode: ['nl-el', 'listen', 'el-nl'][i % 3] }));
  }
  return q.filter(Boolean);
}
function numberRange() {
  const r = [null, [0, 10], [0, 20], [0, 100], [0, 2999]];
  let k = 0; for (let i = 1; i <= 4; i++) if (isDone('n' + i)) k = i;
  return r[k];
}

// ---------- sessie ----------
let ses = null, view = 'home', openSec = null;

function startSession(mode, node, q) {
  if (!q.length) return;
  ses = { mode, node, q, i: 0, ok: 0, n: 0, first: {}, noSpeak: false };
  fill($('#app'), h('div', { class: 'ses' },
    h('div', { class: 'ses-top' },
      h('button', { class: 'x', 'aria-label': 'Stoppen', onclick: () => { if (confirm('Stoppen met deze sessie? Je voortgang in deze sessie gaat verloren.')) { stopAudio(); ses = null; render(); } } }, '✕'),
      h('div', { class: 'bar' }, h('i', { id: 'bar' }))),
    h('div', { id: 'ex' }), h('div', { id: 'foot', class: 'foot' })));
  nextEx();
}
function stopAudio() { if (hasTTS) speechSynthesis.cancel(); }
function advance() { ses.i++; nextEx(); }
function nextEx() {
  if (ses.i >= ses.q.length) return finish();
  $('#bar').style.width = (100 * ses.i / ses.q.length) + '%';
  const ex = ses.q[ses.i], main = $('#ex'), foot = $('#foot');
  fill(main); main.className = 'off'; void main.offsetWidth; main.className = ''; // leegmaken en animatie opnieuw starten
  foot.className = 'foot'; fill(foot);
  RENDER[ex.t](ex, main, foot);
  main.scrollTop = 0;
}
function mark(id, ok) { if (id) ses.first[id] = ses.first[id] !== false && ok; }
function answer(ex, ok, fb = {}) {
  $('#ex').classList.add('locked');
  if (!ex.retry) { ses.n++; if (ok) ses.ok++; }
  if (!fb.marked) mark(ex.id, ok);
  if (!ok && ses.mode !== 'test' && !ex.retry) ses.q.push(Object.assign({}, ex, { retry: true }));
  const foot = $('#foot');
  foot.className = 'foot ' + (ok ? 'ok' : 'bad');
  const showTl = S.settings.translit && fb.el;
  fill(foot, 
    h('div', { class: 'fbt' }, ok ? pick(['Goed', 'Klopt', 'Precies', 'Σωστά']) : 'Niet helemaal'),
    !ok && fb.right ? h('div', {}, 'Juist: ', h('b', {}, fb.right)) : null,
    fb.el ? h('div', { class: 'fbel' }, h('b', {}, fb.el), showTl ? h('span', { class: 'tl' }, '  ' + translit(fb.el)) : null, fb.nl ? ' · ' + fb.nl : null) : null,
    h('button', { class: 'btn', onclick: advance }, 'Verder'));
  if (fb.el && fb.sayAfter) say(fb.el);
}
const plainNext = (foot, label) => fill(foot, h('button', { class: 'btn', onclick: advance }, label || 'Verder'));

function choiceUI(ex, main, cfg) {
  const btns = cfg.opts.map(o => h('button', { class: 'opt' + (cfg.grOpts ? ' gr' : ''), onclick: e => {
    e.currentTarget.classList.add(o.ok ? 'ok' : 'bad');
    btns.forEach((b, i) => { if (cfg.opts[i].ok) b.classList.add('ok'); });
    answer(ex, o.ok, cfg.fb);
  } }, o.text));
  put(main, 
    h('p', { class: 'label' }, cfg.label),
    cfg.hide ? speaker(cfg.say, true) : null,
    !cfg.hide && cfg.big ? h('div', { class: 'row' }, h('div', { class: 'grow prompt' + (cfg.grBig ? ' greek' : '') + (cfg.huge ? ' huge' : '') }, cfg.big), cfg.say && audioOn() ? speaker(cfg.say) : null) : null,
    cfg.small ? h('p', { class: 'muted' }, cfg.small) : null,
    h('div', { class: 'opts' }, btns));
  if (cfg.say && cfg.autoplay) say(cfg.say);
}
function tileUI(ex, main, foot, cfg) {
  const tiles = cfg.tiles, chosen = [];
  const ansEl = h('div', { class: 'answer' }), poolEl = h('div', { class: 'pool' });
  const check = h('button', { class: 'btn', disabled: true, onclick: () => answer(ex, cfg.check(chosen.map(i => tiles[i])), cfg.fb) }, 'Controleer');
  const draw = () => {
    fill(ansEl, cfg.pre ? h('span', { class: 'pre' }, cfg.pre) : null,
      chosen.map((ti, k) => h('button', { class: 'tile' + (cfg.letters ? ' letter' : ''), onclick: () => { chosen.splice(k, 1); draw(); } }, tiles[ti])));
    fill(poolEl, tiles.map((t, ti) => h('button', { class: 'tile' + (cfg.letters ? ' letter' : '') + (chosen.includes(ti) ? ' used' : ''), onclick: () => { chosen.push(ti); draw(); } }, t)));
    check.disabled = !chosen.length;
  };
  put(main, 
    h('p', { class: 'label' }, cfg.label),
    cfg.hide ? speaker(cfg.say, true) : null,
    !cfg.hide && cfg.big ? h('div', { class: 'row' }, h('div', { class: 'grow prompt' + (cfg.grBig ? ' greek' : '') }, cfg.big), cfg.say && audioOn() ? speaker(cfg.say) : null) : null,
    ansEl, poolEl);
  put(foot, check);
  draw();
  if (cfg.say && cfg.autoplay) say(cfg.say);
}

const RENDER = {
  tip(ex, main, foot) {
    put(main, h('div', { class: 'tipcard' }, h('h3', {}, ex.title), h('p', {}, ex.text)));
    plainNext(foot, 'Begin');
  },
  intro(ex, main, foot) {
    const it = ITEMS[ex.id];
    const tl = S.settings.translit;
    if (it.track === 'alpha') {
      put(main, h('p', { class: 'label' }, 'Nieuwe letter'), h('div', { class: 'introcard' },
        h('div', { class: 'prompt huge' }, it.el),
        h('div', { class: 'nl' }, 'klinkt als ', h('b', {}, it.nl)),
        h('div', { class: 'muted' }, it.hint),
        it.name !== 'combinatie' ? h('div', { class: 'muted small' }, 'naam: ' + it.name) : null,
        h('div', { class: 'row', style: 'margin-top:14px' }, speaker(it.ex), h('div', { style: 'text-align:left' }, h('div', { class: 'prompt' }, it.ex), h('div', { class: 'tl' }, translit(it.ex) + ' · ' + it.exnl)))));
      say(it.ex);
    } else if (it.track === 'num') {
      put(main, h('p', { class: 'label' }, 'Nieuw getal'), h('div', { class: 'introcard' },
        h('div', { class: 'prompt huge' }, it.nl), h('div', { class: 'prompt greek' }, it.el),
        tl ? h('div', { class: 'tl' }, translit(it.el)) : null, speaker(it.el)));
      say(it.el);
    } else {
      put(main, h('p', { class: 'label' }, 'Nieuw woord'), h('div', { class: 'introcard' },
        h('div', { class: 'prompt greek' }, it.el),
        tl ? h('div', { class: 'tl' }, translit(it.el)) : null,
        h('div', { class: 'nl' }, it.nl), speaker(it.el)));
      say(it.el);
    }
    plainNext(foot);
  },
  mc(ex, main) {
    const it = ITEMS[ex.id];
    let mode = ex.mode;
    if (mode === 'listen' && (!audioOn() || it.track === 'alpha')) mode = 'el-nl';
    const optField = mode === 'nl-el' ? 'el' : 'nl';
    const opts = shuffle([it].concat(distractors(it, 3, optField))).map(x => ({ text: x[optField], ok: x.id === it.id }));
    const fbBase = it.track === 'alpha' ? { el: it.ex, nl: it.exnl, right: mode === 'nl-el' ? it.el : it.nl, sayAfter: true } : { el: it.el, nl: it.nl, right: it[optField] };
    if (it.track === 'alpha') {
      if (mode === 'el-nl') choiceUI(ex, main, { label: 'Welke klank hoort bij deze letter?', big: it.el, huge: true, opts, fb: fbBase });
      else choiceUI(ex, main, { label: 'Welke letter heeft deze klank?', big: it.nl, small: it.hint.replace(/\s*\(dus[^)]*\)/, ''), opts, grOpts: true, fb: fbBase });
    } else if (it.track === 'num') {
      if (mode === 'listen') choiceUI(ex, main, { label: 'Welk getal hoor je?', say: it.el, hide: true, autoplay: true, opts, fb: fbBase });
      else if (mode === 'el-nl') choiceUI(ex, main, { label: 'Welk getal is dit?', big: it.el, grBig: true, say: it.el, autoplay: true, opts, fb: fbBase });
      else choiceUI(ex, main, { label: 'Hoe zeg je dit getal?', big: it.nl, huge: true, opts, grOpts: true, fb: Object.assign({ sayAfter: true }, fbBase) });
    } else if (mode === 'listen') choiceUI(ex, main, { label: 'Wat betekent wat je hoort?', say: it.el, hide: true, autoplay: true, opts, fb: fbBase });
    else if (mode === 'el-nl') choiceUI(ex, main, { label: 'Wat betekent dit?', big: it.el, grBig: true, say: it.el, autoplay: true, opts, fb: fbBase });
    else choiceUI(ex, main, { label: 'Hoe zeg je dit in het Grieks?', big: it.nl, opts, grOpts: true, fb: Object.assign({ sayAfter: true }, fbBase) });
  },
  read(ex, main) {
    let mode = ex.mode; if (mode === 'listen' && !audioOn()) mode = 'w-t';
    const others = sample(ex.pool.filter(w => w !== ex.word), 3);
    const all = shuffle([ex.word].concat(others));
    const fb = { el: ex.word, right: mode === 'w-t' ? translit(ex.word) : ex.word, sayAfter: mode !== 'listen' };
    if (mode === 'w-t') choiceUI(ex, main, { label: 'Hoe spreek je dit uit?', big: ex.word, grBig: true, opts: all.map(w => ({ text: translit(w), ok: w === ex.word })), fb });
    else if (mode === 't-w') choiceUI(ex, main, { label: 'Welk woord klinkt zo?', big: translit(ex.word), opts: all.map(w => ({ text: w, ok: w === ex.word })), grOpts: true, fb });
    else choiceUI(ex, main, { label: 'Welk woord hoor je?', say: ex.word, hide: true, autoplay: true, opts: all.map(w => ({ text: w, ok: w === ex.word })), grOpts: true, fb });
  },
  cog(ex, main) {
    const [el, nl] = ex.pair;
    const opts = shuffle([ex.pair].concat(sample(ex.pool.filter(p => p[0] !== el), 3))).map(p => ({ text: p[1], ok: p[0] === el }));
    choiceUI(ex, main, { label: 'Lees het woord. Wat zou het betekenen?', big: el, grBig: true, opts, fb: { el, nl, right: nl, sayAfter: true } });
  },
  match(ex, main, foot) {
    const its = ex.ids.map(id => ITEMS[id]);
    let selL = null, selR = null, left = its.length, allOk = true;
    const mk = (it, side) => {
      const b = h('button', { class: side === 'L' ? 'gr' : '', onclick: () => {
        if (side === 'L') { if (selL) selL.b.classList.remove('sel'); selL = { it, b }; if (it.track !== 'alpha') say(it.el); }
        else { if (selR) selR.b.classList.remove('sel'); selR = { it, b }; }
        b.classList.add('sel');
        if (selL && selR) {
          const a = selL, c = selR; selL = selR = null;
          a.b.classList.remove('sel'); c.b.classList.remove('sel');
          if (a.it.id === c.it.id) {
            a.b.classList.add('gone'); c.b.classList.add('gone');
            if (--left === 0) answer(ex, allOk, { marked: true });
          } else {
            allOk = false; mark(a.it.id, false); mark(c.it.id, false);
            [a.b, c.b].forEach(x => { x.classList.add('shake'); setTimeout(() => x.classList.remove('shake'), 350); });
          }
        }
      } }, side === 'L' ? it.el : it.nl);
      return b;
    };
    put(main, h('p', { class: 'label' }, 'Zoek de paren bij elkaar'),
      h('div', { class: 'match' }, h('div', { class: 'col' }, shuffle(its).map(x => mk(x, 'L'))), h('div', { class: 'col' }, shuffle(its).map(x => mk(x, 'R')))));
  },
  spell(ex, main, foot) {
    const it = ITEMS[ex.id], p = spellParts(it.el);
    const letters = [...p.w];
    const extra = sample([...'αεηιοκλμνπρστυ'].filter(c => !letters.includes(c)), 2);
    tileUI(ex, main, foot, { label: 'Bouw het Griekse woord', big: it.nl, pre: p.pre, letters: true, tiles: shuffle(letters.concat(extra)),
      check: a => a.join('') === p.w, fb: { el: it.el, nl: it.nl, right: it.el, sayAfter: true } });
  },
  build(ex, main, foot) {
    let mode = ex.mode; if (mode === 'listen' && !audioOn()) mode = 'nl-el';
    const toNl = mode === 'el-nl';
    const target = sentTokens(toNl ? ex.s.nl : ex.s.el);
    const field = toNl ? 'nl' : 'el';
    const have = new Set(target.map(norm));
    const others = UNITS.flatMap(u => u.sents).filter(s => s !== ex.s);
    const dis = [];
    for (const s of sample(others, 12)) for (const t of sentTokens(s[field])) { if (dis.length < 3 && !have.has(norm(t)) && t.length > 1) { have.add(norm(t)); dis.push(t); break; } }
    const fb = { el: ex.s.el, nl: ex.s.nl, right: toNl ? ex.s.nl : ex.s.el, sayAfter: mode === 'nl-el' };
    const cfg = { tiles: shuffle(target.concat(dis)), check: a => norm(a.join(' ')) === norm(target.join(' ')), fb };
    if (mode === 'nl-el') tileUI(ex, main, foot, Object.assign(cfg, { label: 'Vertaal naar het Grieks', big: ex.s.nl }));
    else if (mode === 'listen') tileUI(ex, main, foot, Object.assign(cfg, { label: 'Bouw de zin die je hoort', say: ex.s.el, hide: true, autoplay: true }));
    else tileUI(ex, main, foot, Object.assign(cfg, { label: 'Vertaal naar het Nederlands', big: ex.s.el, grBig: true, say: ex.s.el, autoplay: true }));
  },
  num(ex, main, foot) {
    const word = elNum(ex.n);
    let mode = ex.mode; if (mode === 'listen' && !audioOn()) mode = 'read';
    const fb = { el: word, nl: String(ex.n), right: mode === 'tiles' ? word : String(ex.n), sayAfter: mode !== 'listen' };
    if (mode === 'tiles') {
      const t = word.split(' ');
      const dis = sample(['δύο', 'τρία', 'πέντε', 'επτά', 'δέκα', 'είκοσι', 'τριάντα', 'πενήντα', 'εκατόν', 'διακόσια', 'χίλια'].filter(x => !t.includes(x)), 3);
      return tileUI(ex, main, foot, { label: 'Bouw dit getal in het Grieks', big: String(ex.n), tiles: shuffle(t.concat(dis)), check: a => a.join(' ') === word, fb });
    }
    const input = h('input', { type: 'text', inputmode: 'numeric', class: 'numin', placeholder: '…', autocomplete: 'off' });
    const check = h('button', { class: 'btn', onclick: () => { if (input.value.trim() === '') return; input.blur(); answer(ex, parseInt(input.value.replace(/\D/g, ''), 10) === ex.n, fb); } }, 'Controleer');
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check.click(); });
    put(main, h('p', { class: 'label' }, mode === 'listen' ? 'Welk getal hoor je? Typ het in cijfers' : 'Welk getal is dit? Typ het in cijfers'),
      mode === 'listen' ? speaker(word, true) : h('div', { class: 'prompt greek' }, word), input);
    put(foot, check);
    if (mode === 'listen') say(word);
  },
  speak(ex, main, foot) {
    if (!speakOn() || ses.noSpeak) return advance();
    const status = h('p', { class: 'muted center', style: 'min-height:48px' }, SR ? 'Tik op de microfoon en zeg het hardop.' : 'Zeg het hardop en beoordeel jezelf.');
    const done = ok => { mark(ex.id, ok); answer(ex, ok, { el: ex.el, nl: ex.nl, marked: true }); };
    let rec = null;
    const mic = SR ? h('button', { class: 'mic', 'aria-label': 'Spreek', html: ICON_MIC, onclick: () => {
      if (rec) return;
      stopAudio();
      try {
        rec = new SR(); rec.lang = 'el-GR'; rec.maxAlternatives = 5; rec.interimResults = false;
        let got = false;
        rec.onresult = e => {
          got = true;
          const alts = Array.from(e.results[0]).map(a => a.transcript);
          const best = Math.max(...alts.map(a => similarity(norm(a), norm(ex.el))));
          if (best >= 0.7) done(true);
          else fill(status, 'Ik verstond: ', h('b', {}, alts[0] || '…'), '. Probeer het nog eens of beoordeel jezelf.');
        };
        rec.onerror = () => { got = true; status.textContent = 'De microfoon werkt nu niet. Zeg het hardop en beoordeel jezelf.'; };
        rec.onend = () => { mic.classList.remove('live'); rec = null; if (!got) status.textContent = 'Ik hoorde niets. Probeer het nog eens of beoordeel jezelf.'; };
        mic.classList.add('live'); status.textContent = 'Ik luister…'; rec.start();
      } catch (e) { rec = null; status.textContent = 'Spraakherkenning is niet beschikbaar. Beoordeel jezelf.'; }
    } }) : null;
    put(main, h('p', { class: 'label' }, 'Zeg dit hardop'),
      h('div', { class: 'row' }, h('div', { class: 'grow prompt greek' }, ex.el), audioOn() ? speaker(ex.el) : null),
      S.settings.translit ? h('div', { class: 'tl' }, translit(ex.el)) : null,
      ex.nl ? h('p', { class: 'muted' }, ex.nl) : null,
      h('div', { class: 'spacer' }), mic, status);
    put(foot, h('div', { class: 'two' }, h('button', { class: 'btn ghost', onclick: () => done(false) }, 'Nog lastig'), h('button', { class: 'btn ghost', onclick: () => done(true) }, 'Ging goed')),
      h('button', { class: 'link', onclick: () => { ses.noSpeak = true; advance(); } }, 'Nu even niet spreken'));
    say(ex.el);
  },
};

// ---------- afronden ----------
function finish() {
  stopAudio();
  const t = today(), { mode, node } = ses;
  const pct = ses.n ? Math.round(100 * ses.ok / ses.n) : 100;
  const firstIds = Object.keys(ses.first);
  const missed = firstIds.filter(id => ses.first[id] === false);
  let title = 'Klaar', lines = [], extra = [], list = [];

  if (mode === 'lesson') {
    const wasDone = isDone(node.id);
    S.done[node.id] = S.done[node.id] || t;
    if (!S.start) S.start = t;
    node.items.forEach(id => { if (!S.items[id]) S.items[id] = { b: 1, d: t + 1 }; });
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
    title = 'Les klaar';
    lines.push(`${ses.ok} van ${ses.n} in één keer goed.`);
    if (!wasDone) lines.push(node.track === 'word' ? 'Deze woorden komen morgen terug in je herhaling.' : 'Dit komt morgen terug in je herhaling.');
    list = node.items;
  } else if (mode === 'review') {
    firstIds.forEach(id => { if (S.items[id]) grade(id, ses.first[id]); });
    title = 'Herhaling klaar';
    lines.push(`${ses.ok} van ${ses.n} in één keer goed.`);
    if (missed.length) lines.push('Wat je miste zie je morgen opnieuw.');
    list = missed;
  } else if (mode === 'practice') {
    firstIds.forEach(id => { if (S.items[id] && ses.first[id] === false) grade(id, false); });
    title = 'Oefening klaar';
    lines.push(`${ses.ok} van ${ses.n} in één keer goed.`);
    list = missed;
  } else if (mode === 'test') {
    const pass = pct >= 80;
    firstIds.forEach(id => {
      const ok = ses.first[id];
      if (!S.items[id]) S.items[id] = ok ? { b: 2, d: t + 3 } : { b: 1, d: t };
      else if (!ok) { grade(id, false); S.items[id].d = t; }
    });
    const prev = S.tests[node.id];
    S.tests[node.id] = { score: pct, day: t, pass: pass || !!(prev && prev.pass) };
    const secNodes = SECTIONS[node.sec].nodes.map(i => NODES[i]);
    const lessonsDone = secNodes.every(n => n === node || isDone(n.id));
    const passNow = () => {
      secNodes.forEach(n => { S.done[n.id] = S.done[n.id] || t; n.items.forEach(id => { if (!S.items[id]) S.items[id] = { b: 1, d: t + 1 }; }); });
      if (!S.start) S.start = t;
    };
    title = pass ? 'Toets gehaald' : 'Nog niet gehaald';
    lines.push(`${ses.ok} van ${ses.n} goed: ${pct}%. Voor een voldoende is 80% nodig.`);
    if (pass) { if (!lessonsDone && !node.big) lines.push('De lessen van dit onderdeel zijn overgeslagen; de inhoud komt nog wel langs in je herhaling.'); passNow(); }
    else {
      lines.push(lessonsDone ? 'Wat je miste staat klaar in je herhaling. Probeer de toets daarna opnieuw.' : 'Geen probleem: volg gewoon de lessen van dit onderdeel.');
      if (lessonsDone) extra.push(h('button', { class: 'link', onclick: () => { passNow(); save(); ses = null; render(); } }, 'Toch doorgaan naar het volgende onderdeel'));
    }
    list = missed;
  }
  save();
  const next = currentNode();
  const due = dueIds().length;
  ses = null;
  fill($('#app'), h('div', { class: 'sum' },
    h('h1', {}, title),
    lines.map(l => h('p', { class: 'muted' }, l)),
    list.length ? h('div', { class: 'card' },
      h('p', { class: 'label', style: 'margin-bottom:6px' }, mode === 'lesson' ? 'Nieuw geleerd' : 'Nog even naar kijken'),
      h('div', { class: 'wordlist' }, list.map(id => { const it = ITEMS[id]; return h('button', { class: missed.includes(id) && mode === 'lesson' ? 'miss' : '', onclick: () => say(it.say) }, h('span', { class: 'g' }, it.el), h('span', { class: 'd' }, it.nl)); }))) : null,
    h('div', { class: 'spacer' }), extra,
    mode === 'lesson' && next && unlocked(next) ? h('button', { class: 'btn', onclick: () => startNode(next) }, next.kind === 'test' ? 'Door naar de toets' : 'Volgende les') : null,
    mode === 'test' && pct < 80 ? h('button', { class: 'btn', onclick: () => startNode(node) }, 'Toets opnieuw') : null,
    due && mode !== 'review' ? h('button', { class: 'btn ghost', onclick: startReview }, `Herhalen (${due})`) : null,
    h('button', { class: 'btn ghost', onclick: () => { view = 'home'; render(); } }, 'Klaar voor nu')));
  window.scrollTo(0, 0);
}

function startNode(n) { startSession(n.kind === 'test' ? 'test' : 'lesson', n, n.kind === 'test' ? buildTest(n) : buildLesson(n)); }
function startReview() { const ids = dueIds().slice(0, 20); if (ids.length) startSession('review', null, buildReview(ids)); }
function startPractice() { const ids = sample(Object.keys(S.items).filter(id => ITEMS[id]), 15); if (ids.length) startSession('practice', null, buildReview(ids)); }
function startNumbers() {
  const r = numberRange(); if (!r) return;
  const q = []; for (let i = 0; i < 10; i++) q.push(numEx(randNum(r), ['listen', 'tiles', 'read'][i % 3]));
  startSession('practice', null, q);
}

// ---------- schermen ----------
const PLAN_DAYS = 182, TARGET_DAYS = 160; // zes maanden, met drie weken speling voor gemiste dagen
function pace() {
  const total = NODES.length, doneN = NODES.filter(n => isDone(n.id)).length;
  if (!S.start) return { text: 'Je traject van zes maanden start bij je eerste les.', doneN, total };
  const day = today() - S.start + 1;
  if (doneN >= total) return { text: `Alle lessen afgerond in ${day} dagen. Blijf herhalen om het vast te houden.`, doneN, total };
  const expected = Math.min(total, Math.round(total * day / TARGET_DAYS));
  const diff = doneN - expected;
  const where = diff >= 2 ? `${diff} onderdelen voor op schema` : diff <= -2 ? `${-diff} onderdelen achter op schema` : 'op schema';
  return { text: `Dag ${day} van ${PLAN_DAYS} · ${where}`, doneN, total };
}
function levelInfo(L) {
  const lessons = NODES.filter(n => n.kind === 'lesson' && n.track === 'word' && UNITS[n.unit].level === L);
  const st = stats('word', L);
  const pct = Math.round(100 * (0.4 * lessons.filter(n => isDone(n.id)).length / lessons.length + 0.6 * st.known / st.total));
  return { pct, pass: !!(S.tests['t' + L] && S.tests['t' + L].pass) };
}
const meter = st => h('div', { class: 'meter' },
  h('i', { class: 'm3', style: `width:${100 * st.solid / st.total}%` }),
  h('i', { class: 'm2', style: `width:${100 * (st.known - st.solid) / st.total}%` }),
  h('i', { class: 'm1', style: `width:${100 * (st.seen - st.known) / st.total}%` }));

function viewHome() {
  const cur = currentNode(), due = dueIds().length, p = pace();
  if (openSec === null && cur) openSec = cur.sec;
  const todayCard = h('div', { class: 'card stack' },
    due ? h('div', { class: 'row' }, h('div', { class: 'grow' }, h('h3', {}, 'Herhalen'), h('p', { class: 'muted small' }, `${due} ${due === 1 ? 'onderdeel staat' : 'onderdelen staan'} klaar. Begin hiermee.`)), h('button', { class: 'btn slim', onclick: startReview }, 'Start'))
      : Object.keys(S.items).length ? h('p', { class: 'muted small' }, 'Niets te herhalen vandaag.') : null,
    cur ? h('div', { class: 'row' }, h('div', { class: 'grow' }, h('h3', {}, cur.title), h('p', { class: 'muted small' }, cur.sub)), h('button', { class: 'btn slim' + (due ? ' ghost' : ''), onclick: () => startNode(cur) }, cur.kind === 'test' ? 'Toets' : 'Les'))
      : h('p', {}, 'Je hebt alle lessen afgerond. Blijf herhalen.'));
  let unitNo = 0;
  const path = SECTIONS.map((sec, si) => {
    const nodes = sec.nodes.map(i => NODES[i]);
    const dn = nodes.filter(n => isDone(n.id)).length;
    const name = sec.unit != null ? `${++unitNo}. ${sec.title}` : sec.title;
    const open = openSec === si;
    return h('div', { class: 'sec' + (dn === nodes.length ? ' done' : '') },
      h('button', { class: 'sec-head', onclick: () => { openSec = open ? -1 : si; render(); } },
        h('span', { class: 't' }, name), h('span', { class: 'chip' }, sec.level), h('span', { class: 'n' }, `${dn}/${nodes.length}`)),
      open ? nodes.map(n => h('button', { class: 'node' + (isDone(n.id) ? ' done' : '') + (n === cur ? ' cur' : ''), disabled: !unlocked(n), onclick: () => startNode(n) },
        h('span', { class: 'dot' }, isDone(n.id) ? '✓' : ''),
        h('span', {}, h('div', { class: 'nt' }, n.kind === 'test' ? n.title : (n.track === 'word' ? n.sub : n.title)),
          h('div', { class: 'ns' }, n.kind === 'test' ? (S.tests[n.id] ? `Laatste score ${S.tests[n.id].score}%` : n.sub) : (n.track === 'word' ? n.items.map(id => ITEMS[id].el).slice(0, 3).join(', ') + '…' : n.sub))))) : null);
  });
  return h('div', { class: 'page' },
    h('div', {}, h('h1', {}, 'Ελληνικά'), h('p', { class: 'muted small' }, p.text)),
    todayCard, h('h2', {}, 'Leerpad'), path);
}

function viewProgress() {
  const w = stats('word'), a = stats('alpha'), n = stats('num'), p = pace();
  const A1 = levelInfo('A1'), A2 = levelInfo('A2');
  const levelText = A2.pass ? 'A2 behaald' : A1.pass ? 'A1 behaald, op weg naar A2' : A1.pct >= 100 ? 'A1-stof af: doe de niveautoets' : 'Op weg naar A1';
  const legend = h('div', { class: 'legend' },
    h('span', { style: '--sw:var(--accent-soft)' }, 'net geleerd'), h('span', { style: '--sw:var(--accent-mid)' }, 'gekend'), h('span', { style: '--sw:var(--accent)' }, 'stevig'));
  const card = (title, st, unit) => h('div', { class: 'card' },
    h('div', { class: 'row' }, h('h3', { class: 'grow' }, title), h('span', { class: 'big-num' }, st.known, h('span', { class: 'muted', style: 'font-size:16px;font-weight:500' }, ' / ' + st.total))),
    meter(st), h('p', { class: 'muted small' }, `${st.known} ${unit} gekend, waarvan ${st.solid} stevig. ${st.seen - st.known} net geleerd.`));
  const lv = (L, info, off) => h('div', { class: off ? 'off' : '' },
    h('div', { class: 'lv' }, h('span', {}, L + (info && info.pass ? ' ✓' : '')), h('span', { class: 'muted' }, info ? info.pct + '%' : '')),
    h('div', { class: 'meter' }, h('i', { class: 'm3', style: `width:${info ? info.pct : 0}%` })));
  const range = numberRange(), hasItems = Object.keys(S.items).length > 0;
  return h('div', { class: 'page' },
    h('h1', {}, 'Voortgang'),
    h('div', { class: 'card' },
      h('h3', {}, 'Traject'), h('p', { class: 'muted small' }, p.text),
      h('div', { class: 'meter' }, h('i', { class: 'm3', style: `width:${100 * p.doneN / p.total}%` })),
      h('p', { class: 'muted small' }, `${p.doneN} van ${p.total} lessen en toetsen afgerond.`)),
    h('div', { class: 'card' },
      h('h3', {}, 'Taalniveau'), h('p', { class: 'muted small' }, levelText),
      h('div', { class: 'levels' }, lv('A1', A1), lv('A2', A2), lv('B1', null, true)),
      h('p', { class: 'muted small', style: 'margin-top:10px' }, 'Schatting op basis van afgeronde lessen en gekende woorden. Een ✓ betekent dat je de niveautoets hebt gehaald. B1 vraagt meer woorden en gesprekspraktijk dan deze app biedt.')),
    card('De 1000 belangrijkste woorden', w, 'woorden'),
    card('Alfabet', a, 'letters en combinaties'),
    card('Getallen', n, 'telwoorden'),
    h('div', { class: 'card' }, legend, h('p', { class: 'muted small', style: 'margin-top:8px' }, 'Gekend: je wist het nog na minstens een week aan herhalingen. Stevig: het zit er na ruim een maand nog in.')),
    h('h2', {}, 'Extra oefenen'),
    h('button', { class: 'btn ghost', disabled: !hasItems, onclick: startPractice }, 'Vrij oefenen met geleerde stof'),
    h('button', { class: 'btn ghost', disabled: !range, onclick: startNumbers }, range ? `Getallen oefenen (${range[0]} tot ${range[1]})` : 'Getallen oefenen (na de eerste getallenles)'));
}

function viewSettings() {
  const st = S.settings;
  const toggle = (key, title, sub) => h('div', { class: 'set' }, h('div', { class: 'grow' }, h('div', {}, title), h('div', { class: 'muted small' }, sub)),
    h('button', { class: 'switch' + (st[key] ? ' on' : ''), role: 'switch', 'aria-checked': String(st[key]), 'aria-label': title, onclick: () => { st[key] = !st[key]; save(); render(); } }));
  const voiceNote = !hasTTS ? 'Deze browser kan geen tekst voorlezen.' : elVoice ? `Griekse stem gevonden: ${elVoice.name}.` : 'Nog geen Griekse stem herkend. Tik op "Test geluid"; hoor je niets of een rare uitspraak, installeer dan Grieks via Android-instellingen > Tekst-naar-spraak.';
  const box = h('textarea', { placeholder: 'Plak hier een eerder gemaakte back-up' });
  return h('div', { class: 'page' },
    h('h1', {}, 'Instellingen'),
    h('div', { class: 'card' },
      toggle('audio', 'Geluid', 'Griekse uitspraak en luisteroefeningen'),
      toggle('speak', 'Spreekoefeningen', SR ? 'Met spraakherkenning; je stem gaat daarvoor naar Google' : 'Zonder spraakherkenning: je beoordeelt jezelf'),
      toggle('translit', 'Uitspraakhulp', 'Toont de klank in gewone letters, zoals kaliméra'),
      h('div', { class: 'set' }, h('div', { class: 'grow' }, h('div', {}, 'Spreeksnelheid'), h('div', { class: 'muted small' }, st.rate <= 0.75 ? 'Langzaam' : st.rate >= 1 ? 'Normaal tempo' : 'Iets langzamer')),
        h('input', { type: 'range', min: '0.6', max: '1.1', step: '0.05', value: String(st.rate), 'aria-label': 'Spreeksnelheid', onchange: e => { st.rate = +e.target.value; save(); render(); } })),
      h('div', { class: 'set' }, h('div', { class: 'grow muted small' }, voiceNote), h('button', { class: 'btn slim ghost', onclick: () => say('Καλημέρα! Τι κάνεις;') }, 'Test geluid'))),
    h('h2', {}, 'Back-up'),
    h('div', { class: 'card stack' },
      h('p', { class: 'muted small' }, 'Je voortgang staat alleen op dit toestel. Maak af en toe een back-up, zeker voordat je van telefoon wisselt of browsergegevens wist.'),
      h('button', { class: 'btn ghost', onclick: async () => {
        const txt = JSON.stringify(S); box.value = txt;
        try { await navigator.clipboard.writeText(txt); alert('Back-up gekopieerd. Plak hem ergens waar je hem terugvindt, bijvoorbeeld in een notitie.'); } catch (e) { box.select(); alert('Kopieer de tekst uit het vak en bewaar die ergens.'); }
      } }, 'Back-up kopiëren'),
      box,
      h('button', { class: 'btn ghost', onclick: () => {
        try {
          const s = JSON.parse(box.value);
          if (!s || s.v !== 1 || typeof s.items !== 'object' || typeof s.done !== 'object') throw new Error('vorm');
          if (!confirm('De huidige voortgang op dit toestel vervangen door deze back-up?')) return;
          localStorage.setItem(KEY, JSON.stringify(s)); S = load(); openSec = null; view = 'home'; render();
        } catch (e) { alert('Dit is geen geldige back-up.'); }
      } }, 'Back-up terugzetten')),
    h('button', { class: 'link', onclick: () => { if (confirm('Alle voortgang wissen en opnieuw beginnen?') && confirm('Weet je het zeker? Dit kan niet ongedaan worden gemaakt.')) { S = defaults(); save(); openSec = null; view = 'home'; render(); } } }, 'Alle voortgang wissen'));
}

function render() {
  if (ses) return;
  const page = view === 'progress' ? viewProgress() : view === 'settings' ? viewSettings() : viewHome();
  const tab = (id, label) => h('button', { class: view === id ? 'on' : '', onclick: () => { view = id; render(); window.scrollTo(0, 0); } }, label);
  fill($('#app'), page, h('nav', { class: 'tabs' }, tab('home', 'Leren'), tab('progress', 'Voortgang'), tab('settings', 'Instellingen')));
}

render();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

// Alleen voor geautomatiseerde tests: open de app met #debug achter het adres.
if (location.hash === '#debug') window.__dbg = { get ses() { return ses; }, get S() { return S; }, NODES, ITEMS, UNITS, translit, startNode, startReview, startNumbers, answer, advance, grade, save, render };
