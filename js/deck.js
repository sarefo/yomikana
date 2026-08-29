// What the learner knows, shaped into something to practice on. A deck is a
// flat list of entries — kana, reading, and the saved cards behind it — and
// every mode downstream takes that one shape, so none of them has to care
// whether it is drilling a single group or everything learned so far.

import { CHEERS, toKatakana } from "./kana.js";
import { LEARNED_AT } from "./config.js";
import { store, saveStore, today, script, dir, GROUPS, groupKey, groupState } from "./store.js";

// Everything introduced in the current script, one entry per character. Some
// characters sit in more than one group -- た is in three, and the look-alike
// deck borrows from everywhere -- so without folding them together a mixed
// question could offer the same kana on two buttons.
export function reviewDeck() {
  const byKana = new Map();
  GROUPS.forEach((g, gi) => {
    const st = groupState(gi);
    const key = groupKey(gi);
    g.cards.forEach((card, ci) => {
      if (!st[ci][2]) return;
      let e = byKana.get(card.k);
      if (!e) { e = { k: card.k, r: card.r, refs: [], keys: [] }; byKana.set(card.k, e); }
      e.refs.push(st[ci]);
      e.keys.push(key);
    });
  });
  // weakest copy first: a refresh should meet the character in the group where
  // it is shakiest, and the answer is written back to all of them either way
  for (const e of byKana.values()) {
    e.refs.sort((a, b) => (a[0] - b[0]) || ((b[4] || 0) - (a[4] || 0)));
  }
  return [...byKana.values()];
}

// One group, in the same shape reviewDeck() produces, so everything downstream
// of here can stop caring which kind of session it is running.
export function deckForGroup(gi) {
  const st = groupState(gi);
  const key = groupKey(gi);
  return GROUPS[gi].cards.map((c, ci) => ({ k: c.k, r: c.r, refs: [st[ci]], keys: [key] }));
}

// Every character the learner can read: at LEARNED_AT or better anywhere in
// the current script, in either direction. Recognizing a shape is one skill
// however it was drilled, so a deck learned sound → kana still counts here.
export function learnedKana() {
  const known = new Set();
  GROUPS.forEach((g, gi) => {
    for (const d of ["sound", "read"]) {
      const st = d === dir ? groupState(gi) : store.groups[script + ":" + d + ":" + g.name];
      if (!st || st.length !== g.cards.length) continue;
      g.cards.forEach((card, ci) => { if (st[ci][0] >= LEARNED_AT) known.add(card.k); });
    }
  });
  return known;
}

// One of the cheers, or "" while none of them is readable yet. Combos are
// single cards written with two characters, so the walk tries the pair first.
export function cheer() {
  const known = learnedKana();
  const pool = CHEERS
    .map(p => script === "kata" ? toKatakana(p) : p)
    .filter(p => {
      for (let i = 0; i < p.length;) {
        if (known.has(p.slice(i, i + 2))) i += 2;
        else if (known.has(p[i])) i += 1;
        else return false;
      }
      return true;
    });
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : "";
}

// Reading a character inside a word is not the drill, and does not raise a
// level: recognizing す in すし is a different act from answering す on its
// own, and the tiles measure the second one. It is not nothing either, though
// — a character just read correctly is plainly not forgotten — so its clock is
// set back to today and the fading stops there.
export function touchKana(keep) {
  const now = today();
  let dirty = false;
  GROUPS.forEach((g, gi) => {
    const st = groupState(gi);
    g.cards.forEach((card, ci) => {
      if (!keep.has(card.k) || !st[ci][2] || st[ci][3] === now) return;
      st[ci][3] = now;
      dirty = true;
    });
  });
  if (dirty) saveStore();
}
