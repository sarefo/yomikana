// Every number that tunes the drill, with the reasoning that set it. They live
// together because they are read together: the waits, the decay windows and
// the gate on new characters only make sense against one another.

// Spaced-repetition constants, ported from the original app:
// a card at level L waits nextByLevel[L] questions before it is due again.
export const NEXT_BY_LEVEL = [0, 1, 5, 10, 20];
export const MAX_LEVEL = NEXT_BY_LEVEL.length; // levels run 0..4

// A tile counts what has been learned; the refresh strip counts what is still
// sharp. They need different thresholds, because decay costs the top level
// first: with one bar doing both jobs, six weeks away turns a deck the learner
// still knows perfectly well into 0/15 and reads as erased rather than rusty.
export const LEARNED_AT = MAX_LEVEL - 2;

// How long a new character has to wait its turn. All three have to be clear
// before one is introduced: every character already on the table answered right
// at least NEW_AFTER_LEVEL times, no more than WORKING_SET of them still short
// of the top level, and at least NEW_COOLDOWN questions since the last
// newcomer. Left ungated the deck fills up about twice as fast as it is
// learned — you end up juggling seven half-known characters instead of four.
export const NEW_AFTER_LEVEL = 3;
export const WORKING_SET = 4;
export const NEW_COOLDOWN = 8;

// How long the reading direction keeps the answered character on the screen
// while its sound plays. Long enough to tie the two together, short enough
// that a run of easy answers still feels like a drill.
export const READ_HOLD = 550;

// The silence a newly introduced character gets before it is spoken. Without
// it the introduction lands on the heels of the sound the last answer earned,
// and the two run together as one noise.
export const INTRO_PAUSE = 500;

// A session has no natural end — the filler pass can serve questions forever
// — so it is cut into rounds: every ROUND_LEN resolved questions the drill
// pauses at a checkpoint and asks whether to keep going.
export const ROUND_LEN = 20;

// Levels also fade with wall-clock time, not only with questions asked. The
// waits above are counted in questions, so they stop the moment the tab is
// closed: without this a deck left alone for two months still reads as
// mastered and offers nothing to do. DECAY_DAYS[L] is how long a card sitting
// at level L survives untouched before it slips a level; level 0 has nothing
// left to lose, and an introduced card never falls past DECAY_FLOOR, because
// coming back after a long absence should schedule a refresh rather than read
// as erased progress.
//
// The lower windows are wide on purpose. These are not estimates of when a
// character is forgotten; they are how fast the app is willing to walk you
// back down. Tight ones cascade: 30/10/5 sends a mastered card to the floor
// after seven weeks away, and the deck you left full reads as untouched. At
// 30/21/14 a six-week absence costs two levels and it takes better than two
// months to lose the lot, which is about when that is honestly true.
export const DECAY_DAYS = [0, 0, 14, 21, 30];
export const DECAY_FLOOR = 1;

// Characters that get missed a lot earn shorter waits and faster decay: a
// character you keep getting wrong is not the one that survives a fortnight
// untouched. The cap keeps one terrible afternoon from pinning a card at the
// bottom for good.
export const MISS_CAP = 6;
export const MISS_WEIGHT = 0.25;

// Shown at the foot of the home screen so a phone can tell whether the newest
// build has actually landed. Bump on every release, together with the CACHE
// name in sw.js.
export const APP_VERSION = "v20";
// Reading practice. An item is a whole word rather than a single character, so
// a round is shorter than the drill's. The ramp is what keeps a session from
// opening on a phrase: the first items are short, and the cap lifts every few
// solved, so a round that starts on すし can finish on ありがとう.
export const READING_ROUND = 10;
export const READING_START_UNITS = 3;  // the longest word offered at the start of a round
export const READING_PER_STEP = 4;     // items solved before the cap goes up by one
export const READING_DECOYS = 3;       // spare tiles beside the ones the word needs
export const READING_TILE_CAP = 12;    // and never more tiles than this altogether
// Below this there is not enough to read for a session to be worth opening, and
// the card stays off the home screen rather than offering four words over again.
export const READING_UNLOCK = 8;
// How long a finished word holds the screen with its meaning under it.
export const READING_HOLD = 1200;
// And how long a wrong tile stays red before it can be tapped again. It has to
// come back: a tile that is wrong at this character may be the right one two
// along — ばなな needs な twice — so leaving it dead would strand the word.
export const READING_WRONG_FLASH = 650;
