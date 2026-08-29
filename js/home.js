// The lessons screen: the refresh strip across the top, the deck of group
// tiles under it, and the two switches that decide which script and which
// direction all of it is about.

import { DISPLAY, DIRS, MARK_AT, SCRIPTS } from "./kana.js";
import { MAX_LEVEL, LEARNED_AT, READING_UNLOCK } from "./config.js";
import {
  store, saveStore, script, dir, GROUPS, setScript, setDir,
  groupState, shareLevels, askFace,
} from "./store.js";
import { reviewDeck } from "./deck.js";
import { startSession, REVIEW } from "./quiz.js";
import { startReading, readingPool } from "./reading.js";

const groupListEl = document.getElementById("groupList");
const refreshEl = document.getElementById("refreshCard");
const readEl = document.getElementById("readCard");

function renderRefresh() {
  const deck = reviewDeck();
  const total = deck.length;
  refreshEl.classList.toggle("hidden", total === 0);
  if (!total) return;
  let rusty = 0;
  for (const e of deck) if (e.refs[0][0] < MAX_LEVEL - 1) rusty++;
  const solid = total - rusty;
  refreshEl.classList.toggle("rusty", rusty > 0);
  refreshEl.querySelector(".card-count").innerHTML = "<b>" + solid + "</b>/" + total;
  refreshEl.querySelector(".card-sub").textContent = rusty
    ? rusty + (rusty === 1 ? " character wants" : " characters want") + " another look"
    : "all " + total + " are fresh — a round keeps them that way";
  refreshEl.querySelector(".refresh-bar > i").style.width = (100 * solid / total) + "%";
  refreshEl.setAttribute("aria-label",
    "Refresh, " + rusty + " of " + total + " characters need another look");
}
refreshEl.addEventListener("click", () => startSession(REVIEW));

// Reading practice, offered once there is enough to read. Below that the pool
// is four words deep and a session would be the same four over again, which
// says "you are not ready for this" more clearly than hiding the card does.
function renderReading() {
  const pool = readingPool();
  readEl.classList.toggle("hidden", pool.length < READING_UNLOCK);
  if (pool.length < READING_UNLOCK) return;
  const longest = pool.reduce((n, w) => Math.max(n, w.units.length), 0);
  readEl.querySelector(".card-count").innerHTML = "<b>" + pool.length + "</b> readable";
  readEl.querySelector(".card-sub").textContent = longest >= 5
    ? "whole words and phrases, built one character at a time"
    : "whole words, built one character at a time";
  readEl.setAttribute("aria-label",
    "Reading practice, " + pool.length + " words you can read");
}
readEl.addEventListener("click", startReading);

export function renderHome() {
  shareLevels();
  renderRefresh();
  renderReading();
  groupListEl.innerHTML = "";
  GROUPS.forEach((g, gi) => {
    const st = groupState(gi);
    const learned = st.filter(c => c[0] >= LEARNED_AT).length;
    // green is still reserved for the whole group sitting at the top level
    const full = st.every(c => c[0] >= MAX_LEVEL - 1);
    // the face the group will be asked in, so a tile shows what it is offering
    // rather than one script's version of it in a mode that drills both
    const mark = askFace(g.cards[MARK_AT[gi]]);
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "group-card" + (full ? " full" : "");
    btn.setAttribute("aria-label",
      DISPLAY[gi] + ", " + learned + " of " + g.cards.length + " learned");
    btn.innerHTML =
      '<span class="group-top"><span class="group-index mono">' + (gi + 1) + "</span>" +
      '<span class="group-count" aria-hidden="true"><b>' + learned + "</b>/" + g.cards.length +
      "</span></span>" +
      '<span class="group-mark kana-font' + (mark.length > 1 ? " two" : "") +
      '" aria-hidden="true">' + mark + "</span>" +
      '<span class="group-name">' + DISPLAY[gi] + "</span>" +
      '<span class="group-bar"><i style="width:' + (100 * learned / g.cards.length) + '%"></i></span>';
    btn.addEventListener("click", () => startSession(gi));
    li.appendChild(btn);
    groupListEl.appendChild(li);
  });
}

/* ---------- mode and direction ---------- */
// The left switch picks what is being drilled against what; the right one
// picks which way round. Neither pair of directions belongs to more than one
// mode — "a → あ" means nothing in the mixed mode and "あ → ア" means nothing
// outside it — so the right switch is written from the left one rather than
// fixed in the markup, and the two are never out of step.
const scriptBtns = [...document.querySelectorAll(".script-switch:not(.dir-switch) button")];
const dirBtns = [...document.querySelectorAll(".dir-switch button")];
const native = c => '<span class="native kana-font">' + c + "</span>";
const DIR_LABEL = {
  sound: s => "a → " + native(s.seal),
  read: s => native(s.seal) + " → a",
  h2k: () => native("あ") + " → " + native("ア"),
  k2h: () => native("ア") + " → " + native("あ"),
};
const DIR_ARIA = {
  sound: "Hear a sound, pick the character",
  read: "See a character, pick the reading",
  h2k: "See a hiragana character, pick the katakana",
  k2h: "See a katakana character, pick the hiragana",
};

function applyScript() {
  const s = SCRIPTS[script];
  const sealEl = document.getElementById("brandSeal");
  sealEl.textContent = s.seal;
  // the mixed mode's seal is a pair, and two characters do not fit at the size
  // one is set in
  sealEl.classList.toggle("two", s.seal.length > 1);
  scriptBtns.forEach(b => b.setAttribute("aria-selected", String(b.dataset.script === script)));
  dirBtns.forEach((b, n) => {
    const d = DIRS[script][n];
    b.dataset.dir = d;
    b.innerHTML = DIR_LABEL[d](s);
    b.setAttribute("aria-label", DIR_ARIA[d]);
  });
}
function applyDir() {
  dirBtns.forEach(b => b.setAttribute("aria-selected", String(b.dataset.dir === dir)));
}
scriptBtns.forEach(b => b.addEventListener("click", () => {
  if (!b.dataset.script || b.dataset.script === script) return;
  setScript(b.dataset.script);
  applyScript();
  // a mode brings its own remembered direction with it, so the right switch
  // has to be re-marked as well as re-labeled
  applyDir();
  renderHome();
  showReset("button");
}));
dirBtns.forEach(b => b.addEventListener("click", () => {
  if (!b.dataset.dir || b.dataset.dir === dir) return;
  setDir(b.dataset.dir);
  applyDir();
  renderHome();
  showReset("button");
}));
applyScript();
applyDir();

/* ---------- reset ---------- */
// Two taps rather than a confirm() dialog: this wipes every group, and a modal
// that can be dismissed by reflex is a poor guard for that.
const resetBtn = document.getElementById("resetBtn");
const resetConfirm = document.getElementById("resetConfirm");
const resetDone = document.getElementById("resetDone");
let resetTimer = 0;

function showReset(which) {
  clearTimeout(resetTimer);
  resetBtn.classList.toggle("hidden", which !== "button");
  resetConfirm.classList.toggle("hidden", which !== "confirm");
  resetDone.classList.toggle("hidden", which !== "done");
}
resetBtn.addEventListener("click", () => showReset("confirm"));
document.getElementById("resetNo").addEventListener("click", () => showReset("button"));
document.getElementById("resetYes").addEventListener("click", () => {
  // settings survive on purpose — erasing progress should not also flip the
  // theme back or turn the sound on again
  store.groups = {};
  store.fails = {};
  store.pairs = {};
  saveStore();
  renderHome();
  showReset("done");
  resetTimer = setTimeout(() => showReset("button"), 2500);
});