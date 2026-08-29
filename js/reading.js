// Reading practice: a whole word at once, built one character at a time from a
// bank of tiles.
//
// The drill asks a character in isolation and takes one tap for an answer.
// That is not reading. Reading is holding your place along a string, taking き
// and ゃ as one sound rather than two, and not losing the fourth character
// while working out the second — none of which a four-button question can ask
// for, because a four-button question is answered by whichever tile differs.
//
// So the answer here is assembled rather than chosen. The word stays on the
// screen and the tiles have to be placed in order, which means every character
// has to be read, in sequence, before the item can end. There is no tile that
// gives the rest away.
//
// Which way round it runs follows the same switch as the drill: seeing the
// characters and producing the reading, or hearing the reading and producing
// the characters.

import { CHOON, READINGS } from "./kana.js";
import {
  READING_ROUND, READING_START_UNITS, READING_PER_STEP,
  READING_DECOYS, READING_TILE_CAP, READING_UNLOCK, READING_HOLD,
  READING_WRONG_FLASH,
} from "./config.js";
import {
  store, saveStore, script, dir, missKey, pairCount, shareLevels,
} from "./store.js";
import { learnedKana, touchKana, cheer } from "./deck.js";
import { readableWords } from "./words.js";
import { stage, openSession, exitSession, showFoot } from "./views.js";
import { speak } from "./speech.js";
import { onTap } from "./tap.js";

let R = null; // active reading session

// Everything the learner could read right now. The home screen asks for it to
// decide whether to offer the mode at all, so it is recomputed rather than
// cached: a session of the drill can add a character and with it a dozen words.
export function readingPool() {
  return readableWords(script, learnedKana());
}

export function startReading() {
  shareLevels();
  const pool = readingPool();
  if (pool.length < READING_UNLOCK) return;
  R = {
    pool,
    item: null,       // the word on the screen
    at: 0,            // how many of its characters have been placed
    tiles: [],        // what is in the bank, in the order it is laid out
    missed: false,    // whether this word has been got wrong yet
    last: "",         // the word before, so the same one does not come twice
    solved: 0,        // items finished this session — the ramp reads this
    round: 0,         // and this is what a checkpoint counts
    roundMisses: 0,
    phase: "item",
    shownAt: 0,
  };
  openSession("Reading", leaveReading);
  nextItem();
}

function leaveReading() {
  R = null;
  exitSession();
}

/* ---------- choosing a word ---------- */

// Short to begin with, longer as the session goes on. The readable pool is
// already self-limiting — a six-character word needs six known characters — but
// the moment one becomes readable it would otherwise be as likely as すし, and
// a round that opens on a phrase teaches nothing but that reading is hard.
function lengthCap() {
  return READING_START_UNITS + Math.floor(R.solved / READING_PER_STEP);
}

function pickWord() {
  const cap = lengthCap();
  let fits = R.pool.filter(w => w.units.length <= cap && w.kana !== R.last);
  // early on the cap can be under everything the learner has: fall back to
  // whatever is shortest rather than serving nothing
  if (!fits.length) {
    const shortest = Math.min(...R.pool.map(w => w.units.length));
    fits = R.pool.filter(w => w.units.length <= shortest && w.kana !== R.last);
  }
  if (!fits.length) fits = R.pool;
  return fits[Math.floor(Math.random() * fits.length)];
}

// The bank: one tile per character the word needs, plus a few that it does not.
// The spares are drawn from characters already confused with one in the word
// before anything else — a bank of far-apart characters would let the word be
// assembled by elimination instead of by reading it.
function buildTiles(item) {
  const tiles = item.units.map(u => ({ k: u.k, r: u.r }));
  const wanted = new Set(item.units.map(u => u.k));
  // no spare tile may read the same as one the word needs: in the reading
  // direction a tile is judged by what it says, and a stray ぢ answers じ
  // perfectly well, which would mark a correct reading wrong
  const spoken = new Set(item.units.map(u => u.r));
  // ranked by how often each has been mixed up with a character in the word.
  // A bank of far-apart characters could be sorted out by elimination instead
  // of by reading, which is the one thing this exercise is for.
  const spare = [];
  for (const k of learnedKana()) {
    if (wanted.has(k) || spoken.has(READINGS.get(k))) continue;
    spare.push({
      k,
      near: item.units.reduce((s, u) => s + (u.k === CHOON ? 0 : pairCount(k, u.k)), 0),
      roll: Math.random(),
    });
  }
  spare.sort((a, b) => b.near - a.near || a.roll - b.roll);

  const room = Math.min(READING_DECOYS, READING_TILE_CAP - tiles.length);
  for (const c of spare) {
    if (tiles.length >= item.units.length + room) break;
    const r = READINGS.get(c.k);
    if (spoken.has(r)) continue;
    spoken.add(r);
    tiles.push({ k: c.k, r, decoy: true });
  }
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
}

/* ---------- the screen ---------- */

function nextItem() {
  R.item = pickWord();
  R.at = 0;
  R.missed = false;
  R.tiles = buildTiles(R.item);
  // the long mark is the one thing here the drill never taught, so the first
  // word that uses it stops to say what it does
  if (!store.settings.sawChoon && R.item.units.some(u => u.k === CHOON)) {
    store.settings.sawChoon = true;
    saveStore();
    renderLongMark();
    return;
  }
  renderItem();
}

function renderItem() {
  R.phase = "item";
  showFoot(true);
  const read = dir === "read";
  // a long word is set smaller rather than allowed to wrap
  const len = R.item.units.length;
  const size = len <= 3 ? " w-short" : len <= 5 ? " w-mid" : " w-long";
  stage.innerHTML =
    '<div class="prompt-zone read-zone">' +
      (read
        ? '<div class="read-word kana-font' + size + '" id="word"></div>'
        : '<button class="read-word read-word-say' + size +
          '" id="word" aria-label="Play the reading again"></button>') +
      '<div class="slots" id="slots"></div>' +
    "</div>" +
    '<div class="bank">' +
    R.tiles.map((t, n) =>
      '<button class="tile' + (read ? " roman" : " kana-font") +
      (!read && t.k.length > 1 ? " two" : "") + '" data-t="' + n + '">' +
      (read ? t.r : t.k) + "</button>"
    ).join("") +
    "</div>";
  paint();
  stage.querySelectorAll(".tile").forEach(btn => onTap(btn, () => tapTile(btn)));
  if (!read) onTap(document.getElementById("word"), () => speak(R.item.kana));
  R.shownAt = performance.now();
  // the sound direction's prompt is the sound, and like the drill's it has to
  // be spoken inside the tap that asked for it
  if (!read) speak(R.item.kana);
}

// The two rows that change as tiles are placed, redrawn without touching the
// bank — a tile that moved under the finger between the tap and the next
// question is the one way this could answer for the learner.
function paint(done) {
  const read = dir === "read";
  const u = R.item.units;
  document.getElementById("word").innerHTML = u.map((x, i) =>
    '<span class="ru' + (done ? " done" : i < R.at ? " done" : i === R.at ? " here" : "") +
    '">' + (read ? x.k : x.r) + "</span>").join("");
  document.getElementById("slots").innerHTML = u.map((x, i) =>
    '<span class="slot' + (i < R.at ? " filled" : "") + '">' +
    (i < R.at ? (read ? x.r : x.k) : "") + "</span>").join("");
}

/* ---------- answering ---------- */

function tapTile(btn) {
  if (!R || R.phase !== "item") return;
  // the same guard the drill uses: a double tap must not answer the screen it
  // brought up
  if (performance.now() - R.shownAt < 130) return;
  const t = R.tiles[Number(btn.dataset.t)];
  const want = R.item.units[R.at];
  // judged by what the tile says in the reading direction and by which
  // character it is in the other, because that is what the prompt asked for
  const hit = dir === "read" ? t.r === want.r : t.k === want.k;

  if (!hit) {
    btn.classList.add("wrong");
    btn.disabled = true;
    // The red is a verdict on the tap, not on the tile. This one is wrong at
    // this character and may be exactly right at the next — ばなな needs な
    // twice, and a word whose only な had been struck off could not be
    // finished at all — so it comes back as soon as the miss has been seen.
    const item = R.item;
    setTimeout(() => {
      if (!R || R.item !== item) return;
      btn.classList.remove("wrong");
      btn.disabled = false;
    }, READING_WRONG_FLASH);
    R.missed = true;
    R.roundMisses++;
    // A misread inside a word is the same information as a wrong tap in the
    // drill — this character was taken for that one — so it is written to the
    // same place, and the drill's rivals and side-by-sides pick it up. The long
    // mark is left out of it: it is not a character anybody confuses, and it has
    // no card for the record to attach to.
    if (t.k !== CHOON && want.k !== CHOON) {
      const mk = missKey(want.k, t.k);
      store.pairs[mk] = Math.min((store.pairs[mk] || 0) + 1, 9);
      saveStore();
    }
    return;
  }

  btn.classList.add("used");
  btn.disabled = true;
  R.at++;
  if (R.at < R.item.units.length) { paint(); return; }
  finishItem();
}

function finishItem() {
  R.phase = "done";
  // Only a clean word moves the ramp. Every word finished counts toward the
  // round, but the cap on how long the next one may be follows what was read
  // without a stumble — otherwise a learner who is missing half of them is
  // handed longer and longer words for having sat through the short ones.
  if (!R.missed) R.solved++;
  R.round++;
  R.last = R.item.kana;
  // every character in it has just been read correctly, whatever else happened
  touchKana(new Set(R.item.units.map(u => u.k)));
  paint(true);
  const read = dir === "read";
  document.getElementById("slots").insertAdjacentHTML("afterend",
    '<p class="gloss">' + R.item.gloss + "</p>");
  // the reading direction withholds the sound until the word is right, the same
  // bargain the drill strikes with a single character
  if (read) speak(R.item.kana);
  setTimeout(() => {
    if (!R || R.phase !== "done") return;
    if (R.round >= READING_ROUND) renderCheckpoint();
    else nextItem();
  }, READING_HOLD);
}

/* ---------- the screens between ---------- */

function renderLongMark() {
  R.phase = "note";
  showFoot(false);
  stage.innerHTML =
    '<div class="mastered">' +
      '<div class="kana-big kana-font">ー</div>' +
      "<h2>The long mark</h2>" +
      "<p>This one has no sound of its own. It holds the vowel just before it," +
      "<br>so ケーキ reads <b>ke-e-ki</b> and コーヒー reads <b>ko-o-hi-i</b>.</p>" +
      '<div class="mastered-actions">' +
        '<button class="primary-btn" id="noteGo">Got it</button>' +
      "</div>" +
    "</div>";
  document.getElementById("noteGo").addEventListener("click", renderItem);
}

function renderCheckpoint() {
  R.phase = "checkpoint";
  showFoot(false);
  const m = R.roundMisses;
  const cheered = cheer();
  const cap = lengthCap();
  const longer = R.pool.filter(w => w.units.length > cap).length;
  stage.innerHTML =
    '<div class="mastered">' +
      (cheered ? '<div class="kana-big kana-font">' + cheered + "</div>" : "") +
      "<h2>Good reading</h2>" +
      "<p>" + READING_ROUND + " words, " +
        (m === 0 ? "no misses" : m === 1 ? "one miss" : m + " misses") + ".<br>" +
        (longer
          ? longer + (longer === 1 ? " longer one is" : " longer ones are") +
            " waiting further in."
          : "Nothing longer in reach yet — more characters, more words.") + "</p>" +
      '<div class="mastered-actions">' +
        '<button class="primary-btn" id="keepGoing">Keep going</button>' +
        '<button class="ghost-btn" id="toHome">Back to lessons</button>' +
      "</div>" +
    "</div>";
  document.getElementById("keepGoing").addEventListener("click", () => {
    R.round = 0;
    R.roundMisses = 0;
    nextItem();
  });
  document.getElementById("toHome").addEventListener("click", leaveReading);
}

/* ---------- keyboard ---------- */
document.addEventListener("keydown", e => {
  if (!R) return;
  if (e.key === "Escape") { leaveReading(); return; }
  if ((R.phase === "checkpoint" || R.phase === "note") && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    const go = document.getElementById(R.phase === "note" ? "noteGo" : "keepGoing");
    if (go) go.click();
    return;
  }
  if (R.phase === "item" && e.key >= "1" && e.key <= "9") {
    const btn = stage.querySelectorAll(".tile")[Number(e.key) - 1];
    if (btn && !btn.disabled) tapTile(btn);
  }
});
