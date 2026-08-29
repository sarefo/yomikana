// The drill: one character at a time, four tiles, and the algorithm that
// decides which character comes next. Everything here is about a single
// question — choosing it, showing it, marking the answer, and the three
// screens that interrupt the run (a confusion compared side by side, a round's
// checkpoint, a group finished).

import { DISPLAY } from "./kana.js";
import {
  MAX_LEVEL, NEXT_BY_LEVEL, NEW_AFTER_LEVEL, WORKING_SET, NEW_COOLDOWN,
  READ_HOLD, INTRO_PAUSE, ROUND_LEN,
} from "./config.js";
import {
  store, saveStore, today, leech, dir,
  groupKey, reviewKey, missKey, pairKey, pairCount, shareLevels,
} from "./store.js";
import { reviewDeck, deckForGroup, cheer } from "./deck.js";
import { stage, openSession, exitSession, showFoot } from "./views.js";
import { speak } from "./speech.js";
import { onTap } from "./tap.js";

let S = null; // active session

export const REVIEW = -1;  // the mixed refresh deck, in place of a group index

export function startSession(gi) {
  shareLevels();
  const review = gi === REVIEW;
  const deck = review ? reviewDeck() : deckForGroup(gi);
  if (!deck.length) return;
  S = {
    gi,
    deck,
    cards: deck.map(e => e.refs[0]),
    failKey: review ? reviewKey() : groupKey(gi),
    forced: -1,           // index to re-ask immediately after a miss; -1 = none
    lastKnown: false,     // true right after a filler question of a mastered card
    current: -1,
    failed: false,        // wrong answer given on the current display
    fails: store.fails[review ? reviewKey() : groupKey(gi)] || 0,
    sinceNew: NEW_COOLDOWN,  // questions since the last new character
    pending: [],          // rivals queued to come back a few questions on
    picks: [],            // deck indices sitting on the current buttons
    comparePair: null,    // a repeated confusion, waiting for its side-by-side
    compared: new Set(),  // pairs already given the side-by-side this session
    round: 0,             // questions resolved since the last checkpoint
    roundFails: 0,        // misses among them

    phase: "question",
    // a refresh has no finish line to celebrate: it runs until you leave
    celebrated: review || deck.every(e => e.refs[0][0] >= MAX_LEVEL - 1),
    shownAt: 0,
  };
  openSession(review ? "Refresh" : DISPLAY[gi], goHome);
  showQuestion();
}

function goHome() {
  S = null;
  exitSession();
}

/* ---------- the algorithm ---------- */

// The gate on pass 2. A character only joins the deck once the ones already in
// it are holding up: none still shaky, not too many mid-flight, and a decent
// stretch of drilling since the last one arrived.
function readyForNew() {
  let inPlay = 0, solid = 0;
  for (let i = 0; i < S.cards.length; i++) {
    const c = S.cards[i];
    if (!c[2]) continue;                    // not introduced yet
    if (c[0] < NEW_AFTER_LEVEL) return false;
    if (c[0] < MAX_LEVEL - 1) inPlay++;     // learned, not yet solid
    else solid++;
  }
  if (inPlay >= WORKING_SET) return false;
  // the cooldown buys drilling time, so it only earns its keep when there is
  // something to drill: with nothing half-known and one lone mastered card to
  // fall back on it would just show that card over and over
  if (S.sinceNew < NEW_COOLDOWN && (inPlay > 0 || solid > 1)) return false;
  return true;
}

function selectQuestion() {
  const cards = S.cards;
  if (S.forced !== -1) return S.forced;

  // pass 0: a rival queued at the last confusion. It sits out a few questions
  // rather than coming straight back — near enough to compare against the miss
  // while it is fresh, not so near that the answer is still on the screen.
  for (const p of S.pending) p.wait--;
  const duePair = S.pending.findIndex(p => p.wait <= 0 && p.i !== S.current);
  if (duePair !== -1) return S.pending.splice(duePair, 1)[0].i;

  // pass 1: weakest due card among those already introduced. A missed card sits
  // at level 0 with no wait left, so it lands here first. Ties go to whichever
  // card has been missed most often -- that is the one wanting the repetition.
  let best = -1, bestLevel = MAX_LEVEL - 1, bestMiss = -1;
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (!c[2] || c[1] !== 0 || c[0] >= MAX_LEVEL - 1) continue;
    if (c[0] < bestLevel || (c[0] === bestLevel && (c[4] || 0) > bestMiss)) {
      bestLevel = c[0]; bestMiss = c[4] || 0; best = i;
    }
  }
  if (best !== -1) { S.lastKnown = false; return best; }

  // pass 2: introduce the next new card — but only if the deck is ready for it
  let fresh = -1;
  for (let i = 0; i < cards.length; i++) {
    if (!cards[i][2]) { fresh = i; break; }
  }
  if (fresh !== -1 && readyForNew()) { S.lastKnown = false; return fresh; }

  // Pulling forward: the soonest-due unmastered card, waits notwithstanding.
  // Misses count as time already served, so a character that keeps going wrong
  // jumps the queue ahead of one that is merely due at the same moment.
  const pullForward = () => {
    let b = -1, bestNext = Infinity;
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i][2] || cards[i][0] >= MAX_LEVEL - 1) continue;
      const due = cards[i][1] / leech(cards[i]);
      if (due < bestNext) { bestNext = due; b = i; }
    }
    return b;
  };

  // pass 3: nothing due — every other question drills the weakest card on
  // the table ahead of its wait; the questions in between fall through to the
  // known characters below. The strict alternation is what spaces a newcomer
  // out: served back to back it would race to the top in four massed repeats,
  // known for the moment and settled not at all.
  if (S.lastKnown) {
    best = pullForward();
    if (best !== -1) { S.lastKnown = false; return best; }
  }

  // pass 4: filler — a mastered card, drawn with a weight rather than evenly,
  // so the ones that have gone wrong before come round more often than the ones
  // that never have. On a refresh this is most of the session.
  S.lastKnown = true;
  const mastered = [], weights = [];
  let total = 0;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i][0] >= MAX_LEVEL - 1) {
      const w = leech(cards[i]);
      mastered.push(i);
      weights.push(w);
      total += w;
    }
  }
  if (mastered.length === 0) {
    // nothing solid to alternate with yet: drill what is on the table, and
    // only reach for a new character once everything else is served
    best = pullForward();
    if (best !== -1) { S.lastKnown = false; return best; }
    return fresh !== -1 ? fresh : 0;
  }
  let roll = Math.random() * total;
  for (let n = 0; n < mastered.length; n++) {
    roll -= weights[n];
    if (roll <= 0) return mastered[n];
  }
  return mastered[mastered.length - 1];
}

function showQuestion() {
  const cards = S.cards;
  S.failed = false;
  const isForced = S.forced !== -1;
  S.current = selectQuestion();
  // every question shown ticks the whole deck down by one
  for (let i = 0; i < cards.length; i++) {
    if (cards[i][1] > 0) cards[i][1]--;
  }
  saveStore();
  renderHud();

  // a character never seen before is shown pre-marked among the four rather
  // than on a card of its own, so the rhythm of the drill never breaks
  const card = cards[S.current];
  const isNew = !isForced && !card[2];
  if (isNew) {
    card[2] = 1;
    S.sinceNew = 0;
    saveStore();
  } else {
    S.sinceNew++;
  }
  showFoot(true);
  renderQuestion(isNew);
}

/* ---------- rendering ---------- */
function kanaOf(i) { return S.deck[i].k; }
function romajiOf(i) { return S.deck[i].r; }

// A character in several groups is answered once and recorded in all of them:
// leaving the other copies behind would have a refresh raise your reading of
// た while three group tiles went on claiming it was never learned.
function syncRefs(entry) {
  const src = entry.refs[0];
  for (let i = 1; i < entry.refs.length; i++) {
    const r = entry.refs[i];
    r[0] = src[0]; r[1] = src[1]; r[3] = src[3];
    r[4] = Math.max(r[4] || 0, src[4]);
  }
}

// ported from the original's ProgressView: `done` is accumulated levels over
// the maximum, `clean` the part of it that was not paid for with a miss
function pieSlices() {
  let sum = 0;
  for (let i = 0; i < S.cards.length; i++) sum += S.cards[i][0];
  const done = Math.round(sum * 100 / (S.cards.length * (MAX_LEVEL - 1)));
  let failPct = sum > 0 ? Math.round(S.fails * 100 / sum) : 0;
  if (failPct > 100) failPct = 100;
  // any miss at all stays visible instead of rounding away to nothing
  if (failPct > 0 && failPct < 5) failPct = 5;
  return { done: done, clean: Math.round((100 - failPct) * done / 100) };
}

function renderHud() {
  const pie = document.getElementById("pie");
  if (!pie) return;
  const p = pieSlices();
  pie.style.setProperty("--done", p.done + "%");
  pie.style.setProperty("--clean", p.clean + "%");
  pie.setAttribute("aria-label", p.done + " percent learned");
}

function renderQuestion(isNew) {
  S.phase = "question";
  const correct = S.current;

  // 3 distractors from the same deck. Two rules the single-group deck never
  // needed: nothing that answers the prompt just as well (a mixed refresh holds
  // both じ and ぢ, and away from their own groups both are "ji"), and a
  // preference for characters that share a group with the right one. Drawn flat
  // from a hundred kana the choices would be trivially far apart, which would
  // make a refresh easier than the drill it is refreshing.
  const pool = S.deck;
  const near = [], far = [], rivals = [];
  for (let i = 0; i < pool.length; i++) {
    if (i === correct || pool[i].r === pool[correct].r) continue;
    if (pairCount(pool[i].k, pool[correct].k)) { rivals.push(i); continue; }
    (pool[i].keys.some(k => pool[correct].keys.includes(k)) ? near : far).push(i);
  }
  // recorded rivals take seats first: telling the pair apart is exactly the
  // discrimination worth practicing, so they keep meeting on the buttons —
  // with the red/green verdict right there — until the confusion is worked off
  rivals.sort((a, b) =>
    pairCount(pool[b].k, pool[correct].k) - pairCount(pool[a].k, pool[correct].k));
  const picks = [correct, ...rivals.splice(0, 2)];
  near.push(...rivals);
  for (const bag of [near, far]) {
    while (picks.length < 4 && bag.length) {
      picks.push(bag.splice(Math.floor(Math.random() * bag.length), 1)[0]);
    }
  }
  const pos = Math.floor(Math.random() * picks.length);
  [picks[0], picks[pos]] = [picks[pos], picks[0]];
  S.picks = picks;
  const p = pieSlices();

  // In the reading direction the prompt is the character itself and the sound
  // is withheld — spoken up front it would answer the question. It arrives on
  // the correct tap instead.
  const read = dir === "read";
  stage.innerHTML =
    '<div class="prompt-zone">' + (read
      ? '<div class="kana-big kana-font' + (kanaOf(correct).length > 1 ? " two" : "") + '">' +
          kanaOf(correct) + "</div>"
      : '<button class="prompt" id="prompt" aria-label="Play the sound again">' +
          '<span class="romaji-big">' + romajiOf(correct) + "</span>" +
          ("speechSynthesis" in window ? '<span class="prompt-hint">tap to repeat</span>' : "") +
        "</button>") +
    "</div>" +
    '<div class="answers">' +
    picks.map((i, n) =>
      read
      ? '<button class="answer roman' + (isNew && i === correct ? " new" : "") +
        '" data-i="' + i + '"><span class="key mono">' + (n + 1) + "</span>" + romajiOf(i) + "</button>"
      : '<button class="answer kana-font' + (kanaOf(i).length > 1 ? " two" : "") +
        (isNew && i === correct ? " new" : "") +
        '" data-i="' + i + '"><span class="key mono">' + (n + 1) + "</span>" + kanaOf(i) + "</button>"
    ).join("") +
    '<div class="pie" id="pie" role="img" style="--done:' + p.done + "%;--clean:" + p.clean +
    '%" aria-label="' + p.done + ' percent learned"></div>' +
    "</div>";
  stage.querySelectorAll(".answer").forEach(btn => {
    onTap(btn, () => answer(btn));
  });
  if (!read) onTap(document.getElementById("prompt"), () => speak(kanaOf(S.current)));
  S.shownAt = performance.now();
  if (!read) {
    // the sound direction's prompt is the sound, and it has to be spoken inside
    // the click that asked for it or Chrome on Android drops it
    speak(kanaOf(correct));
  } else if (isNew) {
    // a brand-new character in the reading direction is shown with its answer
    // already marked, so speaking it gives nothing away — but it waits out a
    // beat of silence first, and only if the question is still the one that
    // asked for it
    const say = kanaOf(correct);
    setTimeout(() => {
      if (S && S.phase === "question" && S.current === correct) speak(say);
    }, INTRO_PAUSE);
  }
}

function answer(btn) {
  if (S.phase !== "question") return;
  // questions advance the instant one is answered, so swallow the tail of a
  // double tap instead of letting it answer the question that just appeared
  if (performance.now() - S.shownAt < 130) return;
  const entry = S.deck[S.current];
  const card = S.cards[S.current];
  const chosen = Number(btn.dataset.i);
  const now = today();

  if (chosen !== S.current) {
    // miss: the card drops to zero, but the screen stays put — the question is
    // not over until the right kana is picked. wrong choices just go red.
    S.failed = true;
    S.forced = S.current;
    card[0] = 0;
    card[1] = 0;
    card[3] = now;
    card[4] = (card[4] || 0) + 1;  // and from now on it comes back sooner
    const mk = missKey(entry.k, S.deck[chosen].k);
    store.pairs[mk] = Math.min((store.pairs[mk] || 0) + 1, 9);
    // a repeat of a known confusion has earned a side-by-side look once the
    // question resolves; a first slip is just a miss. Either order counts
    // toward it — the screen answers a muddled pair, not a muddled direction
    const pk = pairKey(entry.k, S.deck[chosen].k);
    if (pairCount(entry.k, S.deck[chosen].k) >= 2 && !S.compared.has(pk)) {
      S.compared.add(pk);
      S.comparePair = [S.current, chosen];
    }
    // and the rival will come round as a question of its own
    if (S.cards[chosen][2] && !S.pending.some(p => p.i === chosen)) {
      S.pending.push({ i: chosen, wait: 3 });
    }
    S.fails++;
    S.roundFails++;
    store.fails[S.failKey] = S.fails;
    // a miss during a refresh still belongs to the groups the character lives
    // in, so their own tiles and pies stay honest about it
    if (S.gi === REVIEW) {
      for (const k of entry.keys) store.fails[k] = (store.fails[k] || 0) + 1;
    }
    syncRefs(entry);
    saveStore();
    btn.classList.add("wrong");
    btn.disabled = true;
    renderHud();
    return;
  }

  // In the reading direction the sound arrives as the reward for the right
  // answer — given with the question it would have handed the answer over, and
  // given on a wrong tap it would either do the same or name a character that
  // is not on the screen. A miss earns it too, once the right one is found.
  const spoke = dir === "read" && speak(kanaOf(S.current));

  if (!S.failed) {
    // answering with a known rival on the buttons and not falling for it is a
    // won discrimination, and works the recorded confusion back off the books —
    // but only the one that was on trial. This question asked entry.k and the
    // rival was there to be fallen for; that だ was not taken for た says
    // nothing yet about た being taken for だ, which is its own debt.
    for (const i of S.picks) {
      if (i === S.current) continue;
      const mk = missKey(entry.k, S.deck[i].k);
      if (store.pairs[mk] && --store.pairs[mk] === 0) delete store.pairs[mk];
    }
    S.forced = -1;
    if (card[0] < MAX_LEVEL - 1) {
      card[0]++;
      const base = NEXT_BY_LEVEL[card[0]];
      card[1] = base ? Math.max(1, Math.round(base / leech(card))) : 0;
      // reaching the top forgives half the misses: a rough start should not
      // mark a character for life once it is plainly known
      if (card[0] >= MAX_LEVEL - 1) card[4] = card[4] >> 1;
    }
  }
  card[3] = now;
  syncRefs(entry);
  saveStore();
  renderHud();
  S.round++;
  if (spoke) {
    // the sound is the answer to the character on the screen, so the screen
    // waits for it. Advancing underneath it — which is what a synchronous
    // hand-off does, speech being asynchronous — reads as the app pronouncing
    // the next character, and teaches the wrong pairing.
    btn.classList.add("correct");
    stage.querySelectorAll(".answer").forEach(b => { b.disabled = true; });
    setTimeout(advance, READ_HOLD);
  } else {
    // advance synchronously: the next question's audio has to be spoken inside
    // this click, or Chrome on Android drops it for want of a user gesture
    advance();
  }
}

function advance() {
  // the hold is the one moment a question outlives its click: leaving during it
  // has to win, or the drill reappears on top of the home screen
  if (!S) return;
  if (S.comparePair) {
    renderCompare();
  } else if (!S.celebrated && S.cards.every(c => c[0] >= MAX_LEVEL - 1)) {
    S.celebrated = true;
    renderMastered();
  } else if (S.round >= ROUND_LEN && S.forced === -1) {
    renderCheckpoint();
  } else {
    showQuestion();
  }
}

function nextRound() {
  S.round = 0;
  S.roundFails = 0;
  showQuestion();
}

// Where a round pauses. Cleared of due work it is a natural place to stop;
// mid-learning it is just a breather with the score so far.
function renderCheckpoint() {
  S.phase = "checkpoint";
  showFoot(false);
  const caughtUp = S.cards.every(c => c[0] >= MAX_LEVEL - 1);
  const settling = S.cards.filter(c => c[2] && c[0] < MAX_LEVEL - 1).length;
  const waiting = S.cards.filter(c => !c[2]).length;
  const m = S.roundFails;
  const cheered = cheer();
  stage.innerHTML =
    '<div class="mastered">' +
      (cheered ? '<div class="kana-big kana-font">' + cheered + "</div>" : "") +
      "<h2>" + (caughtUp ? "All caught up" : "Good round") + "</h2>" +
      "<p>" + ROUND_LEN + " questions, " +
        (m === 0 ? "no misses" : m === 1 ? "one miss" : m + " misses") + ".<br>" +
        (caughtUp
          ? "Everything is at the top level — more rounds keep it warm."
          : settling + (settling === 1 ? " character" : " characters") + " still settling" +
            (waiting ? ", " + waiting + " waiting to join." : ".")) + "</p>" +
      '<div class="mastered-actions">' +
        '<button class="primary-btn" id="keepGoing">Keep going</button>' +
        '<button class="ghost-btn" id="toHome">Back to lessons</button>' +
      "</div>" +
    "</div>";
  document.getElementById("keepGoing").addEventListener("click", nextRound);
  document.getElementById("toHome").addEventListener("click", goHome);
}

// The screen a repeated mix-up earns: both characters at once, differences on
// display. Contrast is what teaches a discrimination — met one at a time the
// pair just recreates the conditions of the miss.
function renderCompare() {
  S.phase = "compare";
  const pair = S.comparePair;
  S.comparePair = null;
  stage.innerHTML =
    '<div class="compare">' +
      "<h2>Easy to mix up</h2>" +
      '<div class="compare-row">' +
      pair.map(i =>
        '<button class="compare-card" data-i="' + i + '" aria-label="Play ' + romajiOf(i) + '">' +
          '<span class="compare-kana kana-font">' + kanaOf(i) + "</span>" +
          '<span class="compare-romaji">' + romajiOf(i) + "</span>" +
        "</button>"
      ).join("") +
      "</div>" +
      '<p class="compare-sub">Take a moment to spot what sets them apart' +
        ("speechSynthesis" in window ? " — tap either one to hear it" : "") + ".</p>" +
      '<button class="primary-btn" id="compareGo">Continue</button>' +
    "</div>";
  stage.querySelectorAll(".compare-card").forEach(btn => {
    btn.addEventListener("click", () => speak(kanaOf(Number(btn.dataset.i))));
  });
  document.getElementById("compareGo").addEventListener("click", showQuestion);
}

function renderMastered() {
  S.phase = "mastered";
  showFoot(false);
  // same rule as the checkpoint: praise the learner in characters they can
  // read. よくできました asks for ま and で, which a group of vowels and K
  // has not taught anybody yet.
  const cheered = cheer();
  stage.innerHTML =
    '<div class="mastered">' +
      (cheered ? '<div class="kana-big kana-font">' + cheered + "</div>" : "") +
      "<h2>Group mastered</h2>" +
      "<p>All " + S.cards.length + " characters are at the top level.<br>Reviews keep them fresh.</p>" +
      '<div class="mastered-actions">' +
        '<button class="primary-btn" id="keepGoing">Keep reviewing</button>' +
        '<button class="ghost-btn" id="toHome">Back to lessons</button>' +
      "</div>" +
    "</div>";
  document.getElementById("keepGoing").addEventListener("click", nextRound);
  document.getElementById("toHome").addEventListener("click", goHome);
}

/* ---------- keyboard ---------- */
document.addEventListener("keydown", e => {
  if (!S) return;
  if (e.key === "Escape") { goHome(); return; }
  if ((S.phase === "compare" || S.phase === "checkpoint") && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    const go = document.getElementById(S.phase === "compare" ? "compareGo" : "keepGoing");
    if (go) go.click();
    return;
  }
  if (S.phase === "question" && e.key >= "1" && e.key <= "4") {
    const btns = stage.querySelectorAll(".answer");
    const btn = btns[Number(e.key) - 1];
    if (btn && !btn.disabled) answer(btn);
  }
});