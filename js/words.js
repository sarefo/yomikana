// What there is to read. Two lists, because the scripts are not two spellings
// of one vocabulary: hiragana writes the native words, katakana writes what
// Japanese borrowed, and converting one list into the other would produce
// strings that are spelled correctly and mean nothing.
//
// Both lists are written inside what the course teaches, with one exception,
// and the exceptions are worth naming:
//
//   っ / ッ  — absent. The small tsu doubles the consonant after it, which is
//              a rule about the reading rather than a character with a sound,
//              and there is no honest tile for it. It costs the corpus きって
//              and がっこう and サッカー; that is the price of not lying about
//              what a tile means.
//   ー       — present, katakana only. It has no sound of its own either, but
//              it does have an obvious one: whatever vowel came before it. Cut
//              it out and half of the loanwords go with it, so instead it gets
//              a tile carrying that vowel, and a word of introduction the
//              first time it turns up.
//
// Every entry is [written form, what it means]. The glosses are short on
// purpose: this is reading practice, and a definition is a reward at the end
// of a word, not the thing being drilled.

import { READINGS, CHOON } from "./kana.js";

const HIRAGANA_WORDS = [
  // the first two groups reach most of these, so they are what a learner
  // three lessons in actually gets to read
  ["あか", "red"], ["あお", "blue"], ["あさ", "morning"], ["あき", "autumn"],
  ["いえ", "house"], ["いか", "squid"], ["いけ", "pond"], ["いし", "stone"],
  ["いす", "chair"], ["うえ", "above"], ["うし", "cow"], ["うそ", "a lie"],
  ["えき", "station"], ["かお", "face"], ["かさ", "umbrella"], ["かき", "persimmon"],
  ["くさ", "grass"], ["こえ", "voice"], ["ここ", "here"], ["そこ", "there"],
  ["しお", "salt"], ["すし", "sushi"], ["あそこ", "over there"], ["おかし", "sweets"],
  ["きた", "north"], ["にし", "west"], ["くち", "mouth"], ["くつ", "shoes"],
  ["たけ", "bamboo"], ["つき", "the moon"], ["てら", "temple"], ["とし", "a year"],
  ["なつ", "summer"], ["なに", "what"], ["にく", "meat"], ["ねこ", "cat"],
  ["いぬ", "dog"], ["のど", "throat"], ["はし", "bridge"], ["はな", "flower"],
  ["ひと", "person"], ["ふく", "clothes"], ["ふね", "boat"], ["ほし", "star"],
  ["あに", "older brother"], ["あね", "older sister"], ["ちち", "father"],
  ["はは", "mother"], ["ちかてつ", "the subway"], ["さかな", "fish"],
  ["たまご", "egg"], ["あし", "foot"], ["うた", "a song"], ["みせ", "a shop"],

  // and these open up once M · Y · R · W has been through
  ["まち", "town"], ["みち", "road"], ["みみ", "ear"], ["むし", "insect"],
  ["もり", "forest"], ["やま", "mountain"], ["ゆき", "snow"], ["ゆめ", "a dream"],
  ["よる", "night"], ["りす", "squirrel"], ["そら", "sky"], ["あめ", "rain"],
  ["うみ", "the sea"], ["はる", "spring"], ["ふゆ", "winter"], ["とり", "bird"],
  ["かみ", "paper"], ["ゆび", "finger"], ["くるま", "car"], ["まくら", "pillow"],
  ["みどり", "green"], ["ひかり", "light"], ["めがね", "glasses"],
  ["くすり", "medicine"], ["せなか", "back"], ["となり", "next door"],
  ["おかね", "money"], ["てがみ", "a letter"], ["つくえ", "desk"],
  ["やさい", "vegetables"], ["ちいさい", "small"], ["おいしい", "tasty"],
  ["たのしい", "fun"], ["やさしい", "kind"], ["あかるい", "bright"],
  ["おおきい", "big"], ["おもしろい", "interesting"], ["あたらしい", "new"],
  ["うつくしい", "beautiful"],

  // the voiced groups
  ["かぎ", "key"], ["かぜ", "wind"], ["みず", "water"], ["みぎ", "right"],
  ["ひだり", "left"], ["ごご", "afternoon"], ["どこ", "where"], ["だれ", "who"],
  ["ぶた", "pig"], ["ぞう", "elephant"], ["ひざ", "knee"], ["かべ", "wall"],
  ["まど", "window"], ["ちず", "a map"], ["でんわ", "telephone"],
  ["げんき", "healthy"], ["にほん", "Japan"], ["たてもの", "a building"],
  ["たべもの", "food"], ["のみもの", "a drink"], ["くだもの", "fruit"],
  ["どうぶつ", "animal"], ["だいがく", "university"], ["ぎんこう", "bank"],
  ["しんぶん", "newspaper"], ["えんぴつ", "pencil"], ["ひこうき", "airplane"],
  ["ともだち", "friend"], ["せんせい", "teacher"], ["がくせい", "student"],
  ["たまねぎ", "onion"], ["にんじん", "carrot"], ["くつした", "socks"],
  ["ふじさん", "Mt. Fuji"], ["なつやすみ", "summer holiday"],
  ["にちようび", "Sunday"], ["むずかしい", "difficult"],

  // combos
  ["おちゃ", "tea"], ["きょう", "today"], ["ひゃく", "a hundred"],
  ["ちゃいろ", "brown"], ["しゃしん", "a photograph"], ["りょこう", "travel"],
  ["びょうき", "illness"], ["りょうり", "cooking"], ["でんしゃ", "train"],
  ["としょかん", "library"], ["じてんしゃ", "bicycle"], ["しゅくだい", "homework"],
  ["きょうしつ", "classroom"], ["しょくどう", "cafeteria"],
  ["ぎゅうにゅう", "milk"],

  // the longest things here, and the only ones anybody says out loud
  ["おはよう", "good morning"], ["おやすみ", "good night"],
  ["こんにちは", "hello"], ["こんばんは", "good evening"],
  ["ありがとう", "thank you"], ["さようなら", "goodbye"],
  ["すみません", "excuse me"], ["おめでとう", "congratulations"],
  ["いただきます", "before a meal"], ["ごちそうさま", "after a meal"],
  ["はじめまして", "nice to meet you"], ["どういたしまして", "you're welcome"],
];

const KATAKANA_WORDS = [
  ["アイス", "ice"], ["ココア", "cocoa"], ["コース", "a course"],
  ["ケース", "a case"], ["ケーキ", "cake"], ["スキー", "skiing"],
  ["バス", "bus"], ["パン", "bread"], ["ペン", "pen"], ["ドア", "door"],
  ["ビル", "a building"], ["ピザ", "pizza"], ["ノート", "notebook"],
  ["コート", "coat"], ["ボタン", "button"], ["カバン", "bag"],
  ["ズボン", "trousers"], ["テニス", "tennis"], ["ホテル", "hotel"],
  ["トイレ", "toilet"], ["ミルク", "milk"], ["サラダ", "salad"],
  ["パスタ", "pasta"], ["トマト", "tomato"], ["レモン", "lemon"],
  ["メロン", "melon"], ["バナナ", "banana"], ["チーズ", "cheese"],
  ["ラジオ", "radio"], ["テレビ", "television"], ["カメラ", "camera"],
  ["ピアノ", "piano"], ["ギター", "guitar"], ["ナイフ", "knife"],
  ["ドイツ", "Germany"], ["カナダ", "Canada"], ["ロシア", "Russia"],
  ["インド", "India"], ["アジア", "Asia"], ["ダンス", "dance"],
  ["アニメ", "anime"], ["マンガ", "manga"], ["ゲーム", "a game"],
  ["カレー", "curry"], ["ビール", "beer"], ["ワイン", "wine"],
  ["コーラ", "cola"], ["スープ", "soup"], ["ボール", "ball"],
  ["プール", "swimming pool"], ["ガラス", "glass"], ["タオル", "towel"],
  ["カード", "card"], ["メール", "email"], ["ピンク", "pink"],
  ["ブルー", "blue"], ["グレー", "gray"], ["ゴール", "the goal"],
  ["バター", "butter"], ["ソース", "sauce"], ["イチゴ", "strawberry"],
  ["ベルト", "belt"], ["ボート", "boat"], ["コーヒー", "coffee"],
  ["ドラマ", "a drama"], ["スマホ", "smartphone"], ["クラス", "class"],
  ["シャツ", "shirt"], ["ニュース", "the news"], ["メニュー", "menu"],
  ["シャワー", "shower"],

  ["タクシー", "taxi"], ["ジュース", "juice"], ["スプーン", "spoon"],
  ["オレンジ", "orange"], ["アメリカ", "America"], ["イギリス", "England"],
  ["フランス", "France"], ["スペイン", "Spain"], ["スカート", "skirt"],
  ["セーター", "sweater"], ["カーテン", "curtain"], ["テーブル", "table"],
  ["スポーツ", "sport"], ["コンビニ", "convenience store"],
  ["パソコン", "computer"], ["ペンギン", "penguin"], ["スケート", "skating"],
  ["カラオケ", "karaoke"], ["ラーメン", "ramen"], ["スーパー", "supermarket"],
  ["デパート", "department store"], ["エアコン", "air conditioning"],
  ["ライオン", "lion"], ["パンダ", "panda"], ["ゴリラ", "gorilla"],
  ["キリン", "giraffe"], ["テスト", "a test"], ["リモコン", "remote control"],
  ["マラソン", "marathon"], ["グリーン", "green"], ["イエロー", "yellow"],
  ["ブラウン", "brown"], ["シルバー", "silver"], ["ゴールド", "gold"],
  ["テキスト", "textbook"], ["ジョギング", "jogging"],
  ["シャンプー", "shampoo"],

  ["プレゼント", "a present"], ["クリスマス", "Christmas"],
  ["レストラン", "restaurant"], ["バイオリン", "violin"],
  ["ハンバーグ", "hamburg steak"], ["ヨーグルト", "yogurt"],
  ["チョコレート", "chocolate"], ["カレンダー", "calendar"],
  ["ハンバーガー", "hamburger"], ["エレベーター", "elevator"],
  ["スーツケース", "suitcase"], ["コンピューター", "computer"],
  ["アイスクリーム", "ice cream"], ["オーストラリア", "Australia"],
];

const WORDS = { hira: HIRAGANA_WORDS, kata: KATAKANA_WORDS };

// Split a written string into the pieces a reader takes it in one at a time.
// Mostly that is one character each, but not always: a combo (きゃ) is two
// characters carrying a single sound, and the long mark is a character
// carrying no sound of its own — it repeats the vowel it follows, which is
// what makes ケーキ "keeki" and not "keki".
//
// Returns null for anything containing a character the course never teaches,
// which is how the lists above are kept honest.
export function units(str) {
  const out = [];
  for (let i = 0; i < str.length;) {
    const pair = str.slice(i, i + 2);
    if (READINGS.has(pair)) {
      out.push({ k: pair, r: READINGS.get(pair) });
      i += 2;
    } else if (str[i] === CHOON && out.length) {
      const before = out[out.length - 1].r;
      out.push({ k: CHOON, r: before[before.length - 1], held: true });
      i += 1;
    } else if (READINGS.has(str[i])) {
      out.push({ k: str[i], r: READINGS.get(str[i]) });
      i += 1;
    } else {
      return null;
    }
  }
  return out;
}

// Everything in the current script the learner could read right now: every
// character in it is one they know, the long mark excepted — it asks nothing
// of them that the character before it has not already answered.
export function readableWords(script, known) {
  const out = [];
  for (const [kana, gloss] of WORDS[script]) {
    const u = units(kana);
    if (!u) continue;
    if (u.every(x => x.held || known.has(x.k))) out.push({ kana, gloss, units: u });
  }
  return out;
}
