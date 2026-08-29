// The course content: which characters each group teaches, in both scripts.
// Nothing here knows about levels, storage or the screen — it is the syllabary
// and the names we show it under, and nothing else.

const HIRAGANA = [{"name":"vowels_ks","cards":[{"k":"あ","r":"a"},{"k":"い","r":"i"},{"k":"う","r":"u"},{"k":"え","r":"e"},{"k":"お","r":"o"},{"k":"か","r":"ka"},{"k":"き","r":"ki"},{"k":"く","r":"ku"},{"k":"け","r":"ke"},{"k":"こ","r":"ko"},{"k":"さ","r":"sa"},{"k":"し","r":"shi"},{"k":"す","r":"su"},{"k":"せ","r":"se"},{"k":"そ","r":"so"}]},{"name":"sounds_tnh","cards":[{"k":"た","r":"ta"},{"k":"ち","r":"chi"},{"k":"つ","r":"tsu"},{"k":"て","r":"te"},{"k":"と","r":"to"},{"k":"な","r":"na"},{"k":"に","r":"ni"},{"k":"ぬ","r":"nu"},{"k":"ね","r":"ne"},{"k":"の","r":"no"},{"k":"ん","r":"n"},{"k":"は","r":"ha"},{"k":"ひ","r":"hi"},{"k":"ふ","r":"fu"},{"k":"へ","r":"he"},{"k":"ほ","r":"ho"}]},{"name":"sounds_myrw","cards":[{"k":"ま","r":"ma"},{"k":"み","r":"mi"},{"k":"む","r":"mu"},{"k":"め","r":"me"},{"k":"も","r":"mo"},{"k":"や","r":"ya"},{"k":"ゆ","r":"yu"},{"k":"よ","r":"yo"},{"k":"ら","r":"ra"},{"k":"り","r":"ri"},{"k":"る","r":"ru"},{"k":"れ","r":"re"},{"k":"ろ","r":"ro"},{"k":"わ","r":"wa"},{"k":"を","r":"wo"}]},{"name":"sounds_kgtd","cards":[{"k":"た","r":"ta"},{"k":"ち","r":"chi"},{"k":"つ","r":"tsu"},{"k":"て","r":"te"},{"k":"と","r":"to"},{"k":"か","r":"ka"},{"k":"き","r":"ki"},{"k":"く","r":"ku"},{"k":"け","r":"ke"},{"k":"こ","r":"ko"},{"k":"が","r":"ga"},{"k":"ぎ","r":"gi"},{"k":"ぐ","r":"gu"},{"k":"げ","r":"ge"},{"k":"ご","r":"go"},{"k":"だ","r":"da"},{"k":"ぢ","r":"ji"},{"k":"づ","r":"du"},{"k":"で","r":"de"},{"k":"ど","r":"do"}]},{"name":"sounds_szhbp","cards":[{"k":"は","r":"ha"},{"k":"ひ","r":"hi"},{"k":"ふ","r":"fu"},{"k":"へ","r":"he"},{"k":"ほ","r":"ho"},{"k":"さ","r":"sa"},{"k":"し","r":"shi"},{"k":"す","r":"su"},{"k":"せ","r":"se"},{"k":"そ","r":"so"},{"k":"ざ","r":"za"},{"k":"じ","r":"ji"},{"k":"ず","r":"zu"},{"k":"ぜ","r":"ze"},{"k":"ぞ","r":"zo"},{"k":"ば","r":"ba"},{"k":"び","r":"bi"},{"k":"ぶ","r":"bu"},{"k":"べ","r":"be"},{"k":"ぼ","r":"bo"},{"k":"ぱ","r":"pa"},{"k":"ぴ","r":"pi"},{"k":"ぷ","r":"pu"},{"k":"ぺ","r":"pe"},{"k":"ぽ","r":"po"}]},{"name":"similar","cards":[{"k":"た","r":"ta"},{"k":"ち","r":"chi"},{"k":"な","r":"na"},{"k":"に","r":"ni"},{"k":"ぬ","r":"nu"},{"k":"ね","r":"ne"},{"k":"は","r":"ha"},{"k":"ほ","r":"ho"},{"k":"あ","r":"a"},{"k":"き","r":"ki"},{"k":"さ","r":"sa"},{"k":"ま","r":"ma"},{"k":"め","r":"me"},{"k":"ら","r":"ra"},{"k":"る","r":"ru"},{"k":"れ","r":"re"},{"k":"ろ","r":"ro"},{"k":"わ","r":"wa"}]},{"name":"diphthong_1","cards":[{"k":"きゃ","r":"kya"},{"k":"きゅ","r":"kyu"},{"k":"きょ","r":"kyo"},{"k":"しゃ","r":"sha"},{"k":"しゅ","r":"shu"},{"k":"しょ","r":"sho"},{"k":"ちゃ","r":"cha"},{"k":"ちゅ","r":"chu"},{"k":"ちょ","r":"cho"},{"k":"にゃ","r":"nya"},{"k":"にゅ","r":"nyu"},{"k":"にょ","r":"nyo"},{"k":"ひゃ","r":"hya"},{"k":"ひゅ","r":"hyu"},{"k":"ひょ","r":"hyo"},{"k":"じゃ","r":"ja"},{"k":"じゅ","r":"ju"},{"k":"じょ","r":"jo"}]},{"name":"diphthong_2","cards":[{"k":"みゃ","r":"mya"},{"k":"みゅ","r":"myu"},{"k":"みょ","r":"myo"},{"k":"りゃ","r":"rya"},{"k":"りゅ","r":"ryu"},{"k":"りょ","r":"ryo"},{"k":"ぎゃ","r":"gya"},{"k":"ぎゅ","r":"gyu"},{"k":"ぎょ","r":"gyo"},{"k":"ぢゃ","r":"ja"},{"k":"ぢゅ","r":"ju"},{"k":"ぢょ","r":"jo"},{"k":"びゃ","r":"bya"},{"k":"びゅ","r":"byu"},{"k":"びょ","r":"byo"},{"k":"ぴゃ","r":"pya"},{"k":"ぴゅ","r":"pyu"},{"k":"ぴょ","r":"pyo"}]}];

// short enough to sit on a half-width tile without wrapping past two lines,
// and free of kana so one set of titles serves both scripts
// which character stands for each group on its tile: the one that says most
// about what is inside, not just whichever happens to be first
export const MARK_AT = [0, 5, 0, 10, 15, 0, 0, 0];
export const DISPLAY = [
  "Vowels · K · S",
  "T · N · H",
  "M · Y · R · W",
  "Voiced G · D",
  "Voiced Z · B · P",
  "Look-alikes",
  "Combos I",
  "Combos II",
];

// Katakana sits one block above hiragana, so every deck but one converts
// character for character and stays in step with its hiragana twin.
export function toKatakana(str) {
  return str.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
}
// the exception: which characters are easy to confuse is a fact about the
// shapes, not about the sounds, so katakana needs its own look-alike set
const KATAKANA_SIMILAR = [
  { k: "ツ", r: "tsu" }, { k: "シ", r: "shi" }, { k: "ソ", r: "so" }, { k: "ン", r: "n" },
  { k: "ノ", r: "no" }, { k: "メ", r: "me" }, { k: "ヌ", r: "nu" }, { k: "ス", r: "su" },
  { k: "ク", r: "ku" }, { k: "タ", r: "ta" }, { k: "ワ", r: "wa" }, { k: "ウ", r: "u" },
  { k: "フ", r: "fu" }, { k: "ヲ", r: "wo" }, { k: "コ", r: "ko" }, { k: "ユ", r: "yu" },
  { k: "エ", r: "e" }, { k: "ア", r: "a" }, { k: "マ", r: "ma" }, { k: "ム", r: "mu" },
];
const KATAKANA = HIRAGANA.map(g => ({
  name: g.name,
  cards: g.name === "similar" ? KATAKANA_SIMILAR
       : g.cards.map(c => ({ k: toKatakana(c.k), r: c.r })),
}));
export const SCRIPTS = {
  hira: { groups: HIRAGANA, seal: "あ" },
  kata: { groups: KATAKANA, seal: "ア" },
};

// The kana line over a checkpoint is the only unglossed Japanese on the
// screen, so it is worth showing only when it can actually be read: a phrase
// appears once every character in it has been learned, and the line is left
// off until one qualifies. Written without っ, ー or anything else the app
// never teaches, so the check has only cards to weigh. Hiragana here; the
// katakana deck reads them converted, which is how these exclamations are
// often written anyway.
export const CHEERS = [
  "せいかい",    // that's right
  "いいね",      // nice
  "よし",        // alright
  "うまい",      // well done
  "できた",      // got it
  "すごい",      // great
  "さすが",      // impressive
  "ごうかく",    // a pass
  "まんてん",    // full marks
  "かんぺき",    // perfect
  "じょうず",    // skillful
  "おみごと",    // splendid
  "そのちょうし", // that's the way
  "ばんざい",    // hooray
  "ひとやすみ",  // a breather
];