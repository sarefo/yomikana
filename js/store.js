// Everything that outlives a session: the saved levels, the migrations that
// carry old saves forward, and the arithmetic of a card — how fast it fades
// and how much a history of misses costs it. Also the two settings the rest of
// the app reads as if they were globals, because to it they are: which script
// and which direction is being drilled.

import { SCRIPTS } from "./kana.js";
import { DECAY_DAYS, DECAY_FLOOR, MISS_CAP, MISS_WEIGHT } from "./config.js";

export function today() { return Math.floor(Date.now() / 864e5); }
// 1 for a card never missed, up to 2.5 for the worst of them. It divides the
// waits and the decay windows, and weights the draw among mastered cards.
export function leech(card) { return 1 + Math.min(card[4] || 0, MISS_CAP) * MISS_WEIGHT; }

// Walk a card down however many levels its time away has cost it. The days
// each drop consumes are taken off the clock rather than discarded, so a
// return after ten weeks lands where it should instead of costing one level.
function decayCard(c, now) {
  let elapsed = now - c[3];
  if (elapsed <= 0) return false;
  const f = leech(c);
  let dropped = false;
  while (c[0] > DECAY_FLOOR && DECAY_DAYS[c[0]]) {
    const window = Math.max(1, Math.round(DECAY_DAYS[c[0]] / f));
    if (elapsed < window) break;
    elapsed -= window;
    c[0]--;
    c[1] = 0;            // a faded card is due at once
    dropped = true;
  }
  if (dropped) c[3] = now - elapsed;
  return dropped;
}

const STORE_KEY = "yomikana-v1";
const LEGACY_KEY = "hiragana-v1";  // the pre-rename store, no longer read

/* ---------- persistence ---------- */
function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.groups) { s.fails = s.fails || {}; s.pairs = s.pairs || {}; return s; }
  } catch (e) { /* corrupted or unavailable storage: start fresh */ }
  return { groups: {}, settings: {}, fails: {}, pairs: {} };
}
// the rename to Yomikana started the store over; don't leave the old one behind
try { localStorage.removeItem(LEGACY_KEY); } catch (e) { /* nothing to clean */ }
export const store = loadStore();
// decks saved before katakana existed are keyed by bare group name, and every
// one of them is a hiragana deck
for (const bag of [store.groups, store.fails]) {
  for (const k of Object.keys(bag)) {
    if (k.indexOf(":") === -1) { bag["hira:" + k] = bag[k]; delete bag[k]; }
  }
}
// confusions saved before they were counted by direction: a bare pair cannot
// say which way the mistake ran, and a hint is no loss to start over on
for (const k of Object.keys(store.pairs)) {
  if (k.indexOf(">") === -1) delete store.pairs[k];
}
// and decks saved before directions existed all drilled sound → kana
for (const bag of [store.groups, store.fails]) {
  for (const k of Object.keys(bag)) {
    const m = /^(hira|kata):(?!sound:|read:)(.+)$/.exec(k);
    if (m) { bag[m[1] + ":sound:" + m[2]] = bag[k]; delete bag[k]; }
  }
}
export let script = store.settings.script === "kata" ? "kata" : "hira";
// Which way the questions run: "sound" hears a reading and picks the kana,
// "read" sees the kana and picks the reading. Recognizing a character and
// recalling its reading are separate skills, so each direction keeps its own
// levels, misses and fails under its own store keys.
export let dir = store.settings.dir === "read" ? "read" : "sound";
export let GROUPS = SCRIPTS[script].groups;
// The two switches on the home screen are the only things that may move these,
// so they move them through here: an imported binding cannot be assigned from
// the module that reads it, and a script change has to bring its groups along.
export function setScript(s) {
  script = s;
  GROUPS = SCRIPTS[script].groups;
  store.settings.script = script;
  saveStore();
}
export function setDir(d) {
  dir = d;
  store.settings.dir = dir;
  saveStore();
}
export function groupKey(gi) { return script + ":" + dir + ":" + GROUPS[gi].name; }
export function reviewKey() { return script + ":" + dir + ":review"; }
export function saveStore() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* private mode etc. */ }
}

// Confusions are remembered as pairs, not lone characters: what trips a
// learner up is rarely た by itself but た-against-だ, and the cure — meeting
// the rival again — needs both names. Kana are unique across the two scripts,
// so the key needs no script prefix.
//
// Counted, though, they are ordered: taking た for だ is a different mistake
// from taking だ for た, and the easier of the two must not be able to pay off
// the harder one's debt. Recognizing だ when だ is the prompt says nothing
// about whether た still looks like だ when た is.
export function missKey(asked, tapped) { return asked + ">" + tapped; }
export function pairKey(a, b) { return a < b ? a + "|" + b : b + "|" + a; }
// how often the two have been mixed up, whichever way round it ran: which
// characters need to keep meeting on the buttons is a fact about the pair
export function pairCount(a, b) {
  return (store.pairs[missKey(a, b)] || 0) + (store.pairs[missKey(b, a)] || 0);
}
// [level, next, introduced, lastDay, misses]
export function groupState(gi) {
  const key = groupKey(gi);
  const now = today();
  let arr = store.groups[key];
  if (!arr || arr.length !== GROUPS[gi].cards.length) {
    arr = GROUPS[gi].cards.map(() => [0, 0, 0, now, 0]);
    store.groups[key] = arr;
  }
  let dirty = false;
  for (let i = 0; i < arr.length; i++) {
    const c = arr[i];
    // decks saved before the introduced flag existed: anything above level 0
    // has plainly been seen, so it should not be re-announced as new
    if (c.length < 3) c[2] = c[0] > 0 ? 1 : 0;
    // decks saved before decay: start their clock today rather than at the
    // epoch, so installing this version does not fade anybody's progress
    if (c.length < 4) { c[3] = now; dirty = true; }
    if (c.length < 5) { c[4] = 0; dirty = true; }
    if (c[2] && decayCard(c, now)) dirty = true;
  }
  if (dirty) saveStore();
  return arr;
}

// A character is one character, however many decks it appears in. The voiced
// groups are built on their unvoiced partners — が is taught beside か — and
// Look-alikes borrows all eighteen of its cards outright, so a third of the
// course is characters some earlier group already taught. Left with separate
// levels, opening Voiced G · D after the first two groups means grinding
// たちつてとかきくけこ back up from nothing before が is ever introduced.
//
// So a level is shared by kana within a script and direction: the strongest
// copy wins, the rest adopt it, and misses — the record of what is shaky —
// carry across at their worst. Decay has already run by then, so the copy that
// wins is one that has honestly survived its time away.
export function shareLevels() {
  const states = GROUPS.map((g, gi) => groupState(gi));
  const best = new Map();
  GROUPS.forEach((g, gi) => g.cards.forEach((card, ci) => {
    const c = states[gi][ci];
    const b = best.get(card.k);
    if (!b) { best.set(card.k, { src: c, miss: c[4] || 0, seen: c[2] }); return; }
    b.miss = Math.max(b.miss, c[4] || 0);
    b.seen = b.seen || c[2];
    // most recently practiced breaks a tie: of two copies at the same level it
    // is the one with the most life left before decay touches it
    if (c[0] > b.src[0] || (c[0] === b.src[0] && c[3] > b.src[3])) b.src = c;
  }));
  let dirty = false;
  GROUPS.forEach((g, gi) => g.cards.forEach((card, ci) => {
    const c = states[gi][ci];
    const b = best.get(card.k);
    if (c[0] === b.src[0] && c[1] === b.src[1] && c[2] === b.seen &&
        c[3] === b.src[3] && (c[4] || 0) === b.miss) return;
    c[0] = b.src[0]; c[1] = b.src[1]; c[2] = b.seen; c[3] = b.src[3]; c[4] = b.miss;
    dirty = true;
  }));
  if (dirty) saveStore();
}