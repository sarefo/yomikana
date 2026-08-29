// Saying a character out loud, and saying out loud when that fails. The long
// comment below is the reason this file exists at all: speech on a phone goes
// wrong quietly and in several different ways, and a silent trainer that never
// explains itself is worse than one that admits it has lost its voice.

import { store } from "./store.js";
import { APP_VERSION } from "./config.js";

// Speech on a phone fails silently, and in more ways than one. Chrome talks to
// Android's speech service over a binding it does not re-establish once it
// breaks — and it breaks when that service is updated underneath it, which is
// how a phone can go mute in the middle of a week and stay that way until
// Chrome is restarted, every utterance after that failing as synthesis-failed.
// Japanese voice data can also be missing, and an engine can accept an
// utterance and then never speak it. None of it raises anything the person
// holding the phone can see. So the last thing that went wrong is kept and
// said out loud: under the drill, where the silence is noticed, and beside the
// version on the home screen.
const AUDIO_TROUBLE = {
  // the binding above: nothing the page can mend, and a restart does mend it
  "synthesis-failed": "No sound — restart Chrome to reconnect its speech engine.",
  "language-unavailable": "No Japanese voice installed on this phone.",
  "voice-unavailable": "No Japanese voice installed on this phone.",
  "not-allowed": "The browser is holding the sound back.",
  "audio-busy": "Something else on the phone is using the speaker.",
  "audio-hardware": "The phone reports no audio output.",
};
let audioNote = "";
export function noteAudio(msg) {
  if (msg === audioNote) return;
  audioNote = msg;
  const foot = document.getElementById("audioNote");
  if (foot) foot.textContent = msg;
  const ver = document.getElementById("appVersion");
  // the home screen carries it as a footnote to the build number, which is
  // already the line a phone is asked to read back when something is wrong
  if (ver) ver.textContent = APP_VERSION + (msg ? " · no sound" : "");
}

let jaVoice = null;
// once anything has actually been spoken the engine has proved itself, and the
// note about a missing voice has nothing left to warn about
let spokeOnce = false;
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  // Android hands the list over late and sometimes not at all before the first
  // question; an empty list is not yet an answer about what is installed
  if (!voices.length) return;
  const ja = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("ja"));
  // a local voice is one the phone can speak with the network off, which is
  // what an offline trainer wants; a remote one is the fallback
  jaVoice = ja.find(v => v.localService) || ja[0] || null;
  if (!ja.length && !spokeOnce) noteAudio(AUDIO_TROUBLE["voice-unavailable"]);
}
if ("speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.addEventListener("voiceschanged", pickVoice);
}
// Returns whether anything was actually said, so a caller can hold the screen
// for it — a sound is only worth waiting on if it is coming.
export function speak(kana) {
  if (store.settings.sound === false) return false;
  if (!("speechSynthesis" in window)) { noteAudio("This browser cannot speak."); return false; }
  try {
    // voiceschanged does not always arrive, so ask again while there is still a
    // reason to: the list is usually filled in by the first tap even when it
    // was empty at load
    if (!jaVoice) pickVoice();
    const synth = speechSynthesis;
    // A paused synth swallows every utterance put into it and says nothing.
    // Chrome pauses speech when the page goes to the background and does not
    // always resume it on the way back, so a session picked up after a trip to
    // another app can be silent from its very first question.
    if (synth.paused) synth.resume();
    // and only cancel when there is something to cancel: a cancel on an idle
    // synth is one of the ways Android wedges it
    if (synth.speaking || synth.pending) synth.cancel();
    const u = new SpeechSynthesisUtterance(kana);
    // a ja voice if one is installed, otherwise let the platform choose by language
    if (jaVoice) u.voice = jaVoice;
    u.lang = jaVoice ? jaVoice.lang : "ja-JP";
    u.rate = 0.85;
    let started = false;
    u.addEventListener("start", () => { started = true; spokeOnce = true; noteAudio(""); });
    u.addEventListener("error", e => {
      // interrupted and canceled are our own doing — a question answered before
      // its sound had finished — and say nothing about the engine
      if (e.error === "interrupted" || e.error === "canceled") return;
      noteAudio(AUDIO_TROUBLE[e.error] || "The phone refused to speak (" + e.error + ").");
    });
    // an engine that takes an utterance and never speaks it reports nothing at
    // all, so that silence has to be timed rather than caught
    setTimeout(() => {
      if (!started && !audioNote) noteAudio("The phone took the reading and said nothing.");
    }, 1500);
    synth.speak(u);
    return true;
  } catch (e) { noteAudio("The phone refused to speak."); }
  return false;
}