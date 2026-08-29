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
// The small vowels are out on the same grounds as っ: ファ and ティ and ジェ
// are two characters for one sound the course never teaches, so フォーク and
// パーティー are not here however common they are.
//
// Every entry is [written form, what it means]. The glosses are short on
// purpose: this is reading practice, and a definition is a reward at the end
// of a word, not the thing being drilled.
//
// The lists are long because the pool a learner actually sees is a small slice
// of them — everything here whose every character has been learned — and early
// on that slice is thin. A hundred words spread across the whole syllabary is
// four words on the day someone finishes the vowels.

import { READINGS, CHOON } from "./kana.js";

const HIRAGANA_WORDS = [
  // Within the first group alone: vowels, K and S. These are what somebody
  // three lessons in actually has, so the list is deepest here.
  ["あい", "love"], ["あお", "blue"], ["あか", "red"], ["あかい", "red"],
  ["あおい", "blue"], ["あき", "autumn"], ["あさ", "morning"], ["あし", "a foot"],
  ["あせ", "sweat"], ["あそこ", "over there"], ["いえ", "a house"], ["いか", "squid"],
  ["いき", "a breath"], ["いけ", "a pond"], ["いし", "a stone"], ["いす", "a chair"],
  ["うえ", "above"], ["うお", "a fish"], ["うし", "a cow"], ["うそ", "a lie"],
  ["えき", "a station"], ["おか", "a hill"], ["おおい", "many"], ["おおきい", "big"],
  ["おいしい", "tasty"], ["おかし", "sweets"], ["かい", "a shellfish"],
  ["かお", "a face"], ["かき", "a persimmon"], ["かこ", "the past"],
  ["かさ", "an umbrella"], ["かし", "confectionery"], ["きかい", "a machine"],
  ["きく", "a chrysanthemum"], ["きし", "a shore"], ["きせき", "a miracle"],
  ["くさ", "grass"], ["くし", "a comb"], ["けしき", "scenery"], ["こい", "a carp"],
  ["こえ", "a voice"], ["ここ", "here"], ["こし", "the lower back"],
  ["さか", "a slope"], ["さき", "ahead"], ["さけ", "salmon"], ["しあい", "a match"],
  ["しお", "salt"], ["しか", "a deer"], ["しき", "the four seasons"],
  ["すいか", "a watermelon"], ["すき", "fond of"], ["すこし", "a little"],
  ["すし", "sushi"], ["せかい", "the world"], ["せき", "a seat"],
  ["せいかく", "personality"], ["そこ", "there"], ["そうこ", "a warehouse"],
  ["おおきさ", "a size"], ["おおさか", "Osaka"], ["いこう", "let's go"],
  ["こうかい", "regret"], ["さいこう", "the best"], ["かいけい", "the bill"],
  ["きせい", "going home"], ["しあわせ", "happiness"],

  // and these open up once T · N · H has been through
  ["あに", "an older brother"], ["あね", "an older sister"], ["あなた", "you"],
  ["いぬ", "a dog"], ["いと", "thread"], ["いのち", "a life"], ["うた", "a song"],
  ["うち", "home"], ["おと", "a sound"], ["おとこ", "a man"], ["おなか", "a stomach"],
  ["おかね", "money"], ["きた", "north"], ["きのう", "yesterday"],
  ["くち", "a mouth"], ["くつ", "shoes"], ["くに", "a country"], ["こと", "a thing"],
  ["ことし", "this year"], ["さかな", "a fish"], ["した", "below"],
  ["しぬ", "to die"], ["そと", "outside"], ["たいこ", "a drum"], ["たけ", "bamboo"],
  ["たに", "a valley"], ["ちかてつ", "the subway"], ["ちち", "a father"],
  ["つき", "the moon"], ["つくえ", "a desk"], ["つち", "soil"], ["つな", "a rope"],
  ["てき", "an enemy"], ["てつ", "iron"], ["てら", "a temple"], ["とし", "a year"],
  ["とち", "land"], ["となり", "next door"], ["とけい", "a clock"],
  ["なつ", "summer"], ["なに", "what"], ["なか", "the inside"], ["なし", "a pear"],
  ["にく", "meat"], ["にし", "west"], ["ぬの", "cloth"], ["ねこ", "a cat"],
  ["ねつ", "a fever"], ["のち", "later"], ["のど", "a throat"], ["はこ", "a box"],
  ["はし", "a bridge"], ["はた", "a flag"], ["はな", "a flower"], ["はち", "eight"],
  ["はと", "a pigeon"], ["ひと", "a person"], ["ふく", "clothes"],
  ["ふうとう", "an envelope"], ["ふた", "a lid"], ["ふね", "a boat"],
  ["ふとん", "a futon"], ["へた", "unskillful"], ["ほし", "a star"],
  ["ほね", "a bone"], ["ほか", "another"], ["ほとけ", "the Buddha"],
  ["ほん", "a book"], ["ほんとう", "the truth"], ["にんき", "popularity"],
  ["にほん", "Japan"], ["ちかい", "near"], ["たかい", "expensive"],
  ["ちいさい", "small"], ["あたたかい", "warm"], ["たのしい", "fun"],
  ["ひとつ", "one thing"], ["ふたつ", "two things"], ["いつつ", "five things"],
  ["ここのつ", "nine things"], ["とお", "ten"], ["なな", "seven"],
  ["おとうと", "a younger brother"], ["おかあさん", "a mother"],
  ["おとうさん", "a father"], ["おにいさん", "an older brother"],
  ["おねえさん", "an older sister"], ["たいへん", "very hard"],
  ["せんせい", "a teacher"], ["ひこうき", "an airplane"], ["かんこう", "sightseeing"],
  ["しんかんせん", "the bullet train"], ["くうこう", "an airport"],
  ["おてあらい", "a restroom"], ["たいふう", "a typhoon"], ["てんき", "the weather"],
  ["てんいん", "a shop clerk"], ["けいかく", "a plan"], ["せいかつ", "daily life"],
  ["ほうほう", "a method"], ["ちほう", "a region"], ["こうさてん", "an intersection"],
  ["しつもん", "a question"], ["すいえい", "swimming"], ["せいと", "a pupil"],
  ["ふつう", "ordinary"], ["ふうふ", "a married couple"], ["へいわ", "peace"],
  ["ようふく", "clothes"], ["したく", "preparation"], ["いち", "one"],
  ["さんかく", "a triangle"], ["しかく", "a square"], ["こたえ", "an answer"],
  ["かたち", "a shape"], ["ちから", "strength"], ["こころ", "the heart"],
  ["かおいろ", "a complexion"], ["ひとこと", "a single word"],

  // and these once M · Y · R · W is in
  ["あたま", "a head"], ["あまい", "sweet"], ["あめ", "rain"], ["いま", "now"],
  ["いもうと", "a younger sister"], ["うみ", "the sea"], ["うま", "a horse"],
  ["うる", "to sell"], ["えらい", "admirable"], ["おもい", "heavy"],
  ["おや", "a parent"], ["かみ", "paper"], ["から", "empty"], ["かれ", "he"],
  ["かわ", "a river"], ["きもち", "a feeling"], ["くるま", "a car"],
  ["くも", "a cloud"], ["くろい", "black"], ["こめ", "rice"], ["これ", "this"],
  ["さむい", "cold"], ["さら", "a plate"], ["さる", "a monkey"], ["しろい", "white"],
  ["すな", "sand"], ["すもう", "sumo"], ["そら", "the sky"], ["たいよう", "the sun"],
  ["たこ", "an octopus"], ["つくる", "to make"], ["つよい", "strong"],
  ["とり", "a bird"], ["とりにく", "chicken"], ["なまえ", "a name"],
  ["なみ", "a wave"], ["なつやすみ", "the summer holiday"], ["にもつ", "luggage"],
  ["にわ", "a garden"], ["ぬるい", "lukewarm"], ["ねむい", "sleepy"],
  ["のむ", "to drink"], ["はやい", "fast"], ["はやし", "a woods"],
  ["はる", "spring"], ["ひかり", "light"], ["ひろい", "wide"], ["ふゆ", "winter"],
  ["ふるい", "old"], ["へや", "a room"], ["ほたる", "a firefly"],
  ["まえ", "in front"], ["まくら", "a pillow"], ["まち", "a town"],
  ["まつり", "a festival"], ["まる", "a circle"], ["まめ", "a bean"],
  ["みかん", "a mandarin"], ["みせ", "a shop"], ["みち", "a road"],
  ["みみ", "an ear"], ["みる", "to see"], ["むかし", "long ago"],
  ["むし", "an insect"], ["むすこ", "a son"], ["むすめ", "a daughter"],
  ["むら", "a village"], ["もも", "a peach"], ["もり", "a forest"],
  ["もの", "a thing"], ["もん", "a gate"], ["やま", "a mountain"],
  ["やさい", "vegetables"], ["やすみ", "a rest"], ["ゆき", "snow"],
  ["ゆめ", "a dream"], ["ゆか", "a floor"], ["よる", "night"], ["よむ", "to read"],
  ["よこ", "the side"], ["よてい", "a plan"], ["りす", "a squirrel"],
  ["るす", "not at home"], ["れきし", "history"], ["れつ", "a queue"],
  ["ろく", "six"], ["わたし", "I"], ["わたる", "to cross"], ["わかい", "young"],
  ["きつね", "a fox"], ["たぬき", "a raccoon dog"], ["くま", "a bear"],
  ["かめ", "a turtle"], ["せみ", "a cicada"], ["かに", "a crab"],
  ["やさしい", "kind"], ["うつくしい", "beautiful"], ["おもしろい", "interesting"],
  ["あたらしい", "new"], ["あかるい", "bright"], ["くらい", "dark"],
  ["とおい", "far"], ["おそい", "slow"], ["つめたい", "cold to the touch"],
  ["あつい", "hot"], ["ほそい", "thin"], ["ふとい", "thick"], ["かるい", "light"],
  ["よわい", "weak"], ["うれしい", "glad"], ["かなしい", "sad"],
  ["きれい", "pretty"], ["ながい", "long"], ["みじかい", "short"],
  ["せまい", "narrow"], ["からい", "spicy"], ["にがい", "bitter"],
  ["まずい", "bad-tasting"], ["やすい", "cheap"], ["とても", "very"],
  ["たくさん", "many"], ["みんな", "everyone"], ["いつも", "always"],
  ["また", "again"], ["もう", "already"], ["いくら", "how much"],
  ["あした", "tomorrow"], ["まいにち", "every day"], ["まいあさ", "every morning"],
  ["ひるま", "the daytime"], ["かいもの", "shopping"], ["うんてん", "driving"],
  ["せんたく", "laundry"], ["おふろ", "a bath"], ["くすり", "medicine"],
  ["こうえん", "a park"], ["みそしる", "miso soup"], ["うどん", "udon"],
  ["やきとり", "grilled chicken"], ["すきやき", "sukiyaki"], ["さしみ", "sashimi"],
  ["くうき", "the air"], ["いわ", "a rock"], ["せなか", "the back"],
  ["ゆうめい", "famous"], ["たいせつ", "important"], ["のりもの", "a vehicle"],
  ["はたらく", "to work"], ["やくそく", "a promise"], ["もくてき", "a purpose"],
  ["ようじ", "an errand"], ["りゆう", "a reason"], ["ろうか", "a corridor"],
  ["わかもの", "a young person"], ["おきなわ", "Okinawa"], ["よこはま", "Yokohama"],
  ["こうつう", "traffic"], ["ちり", "geography"], ["すうがく", "mathematics"],
  ["かいわ", "conversation"], ["さくら", "a cherry tree"], ["まつ", "a pine"],
  ["ゆり", "a lily"], ["きり", "fog"], ["こおり", "ice"], ["いのり", "a prayer"],

  // the voiced groups
  ["かぎ", "a key"], ["かぜ", "wind"], ["かべ", "a wall"], ["かばん", "a bag"],
  ["ぎんこう", "a bank"], ["くだもの", "fruit"], ["ごご", "the afternoon"],
  ["ごぜん", "the morning"], ["ごはん", "cooked rice"], ["じかん", "time"],
  ["じぶん", "oneself"], ["ぜんぶ", "all of it"], ["そうじ", "cleaning"],
  ["だいがく", "a university"], ["だいどころ", "a kitchen"],
  ["たてもの", "a building"], ["たまご", "an egg"], ["だれ", "who"],
  ["ちず", "a map"], ["でぐち", "an exit"], ["でんき", "electricity"],
  ["でんわ", "a telephone"], ["どうぐ", "a tool"], ["どうぶつ", "an animal"],
  ["どこ", "where"], ["ともだち", "a friend"], ["どようび", "Saturday"],
  ["にちようび", "Sunday"], ["げつようび", "Monday"], ["かようび", "Tuesday"],
  ["すいようび", "Wednesday"], ["もくようび", "Thursday"], ["きんようび", "Friday"],
  ["ねだん", "a price"], ["のみもの", "a drink"], ["たべもの", "food"],
  ["はいざら", "an ashtray"], ["はがき", "a postcard"], ["はじめ", "the beginning"],
  ["はなび", "fireworks"], ["ばんごはん", "dinner"], ["ひげ", "a beard"],
  ["ひざ", "a knee"], ["ひだり", "left"], ["ぶた", "a pig"], ["まど", "a window"],
  ["みぎ", "right"], ["みず", "water"], ["みどり", "green"],
  ["むずかしい", "difficult"], ["めがね", "glasses"], ["もんだい", "a problem"],
  ["ゆうびん", "the mail"], ["ゆび", "a finger"], ["れいぞうこ", "a refrigerator"],
  ["わすれもの", "a lost item"], ["えいが", "a movie"], ["えんぴつ", "a pencil"],
  ["おんがく", "music"], ["かいだん", "stairs"], ["かぐ", "furniture"],
  ["かぞく", "a family"], ["がいこく", "a foreign country"],
  ["げんかん", "an entryway"], ["げんき", "healthy"], ["ことば", "a word"],
  ["こども", "a child"], ["さとう", "sugar"], ["さんぽ", "a walk"],
  ["しごと", "work"], ["しずか", "quiet"], ["したぎ", "underwear"],
  ["しんぶん", "a newspaper"], ["せびろ", "a business suit"],
  ["せんげつ", "last month"], ["せんしゅう", "last week"], ["たばこ", "tobacco"],
  ["てがみ", "a letter"], ["でかける", "to go out"], ["てぶくろ", "gloves"],
  ["どうぶつえん", "a zoo"], ["ねぼう", "oversleeping"], ["はんぶん", "half"],
  ["ひとばん", "one night"], ["ぶんがく", "literature"], ["べんとう", "a lunchbox"],
  ["ぼうえき", "trade"], ["ぼく", "I"], ["まいばん", "every night"],
  ["まんが", "comics"], ["みずうみ", "a lake"], ["みなと", "a harbor"],
  ["ゆうはん", "supper"], ["ゆびわ", "a ring"], ["がくせい", "a student"],
  ["たまねぎ", "an onion"], ["にんじん", "a carrot"], ["くつした", "socks"],
  ["ふじさん", "Mt. Fuji"], ["ぞう", "an elephant"], ["ねずみ", "a mouse"],
  ["へび", "a snake"], ["えび", "a shrimp"], ["とんぼ", "a dragonfly"],
  ["まぐろ", "tuna"], ["ぶたにく", "pork"], ["そば", "buckwheat noodles"],
  ["おにぎり", "a rice ball"], ["なべ", "a hotpot"], ["いちご", "a strawberry"],
  ["りんご", "an apple"], ["ぶどう", "grapes"], ["あぶら", "oil"],
  ["にじ", "a rainbow"], ["ばんざい", "hooray"], ["ちがう", "to differ"],
  ["さびしい", "lonely"], ["いそがしい", "busy"], ["べんり", "convenient"],
  ["ときどき", "sometimes"], ["まだ", "not yet"], ["なぜ", "why"],
  ["ほんだな", "a bookshelf"], ["じしん", "an earthquake"], ["かじ", "a fire"],
  ["げんいん", "a cause"], ["けいざい", "the economy"], ["せいじ", "politics"],
  ["ぎじゅつ", "technology"], ["どりょく", "an effort"], ["やちん", "the rent"],
  ["でんとう", "a tradition"], ["ぶんか", "culture"], ["しぜん", "nature"],

  // combos
  ["おちゃ", "tea"], ["きょう", "today"], ["きょねん", "last year"],
  ["ぎゅうにゅう", "milk"], ["ぎょうざ", "dumplings"], ["きんぎょ", "a goldfish"],
  ["けんきゅう", "research"], ["こうちゃ", "black tea"], ["しゃしん", "a photograph"],
  ["しゃちょう", "a company president"], ["しゅくだい", "homework"],
  ["しゅみ", "a hobby"], ["じゅぎょう", "a class"], ["じゅうしょ", "an address"],
  ["しょうがつ", "New Year"], ["しょうゆ", "soy sauce"], ["しょくじ", "a meal"],
  ["じょうず", "skillful"], ["しんじゅく", "Shinjuku"], ["ちゃいろ", "brown"],
  ["ちゅうい", "caution"], ["ちゅうしゃ", "parking"], ["ちょきん", "savings"],
  ["ちょうしょく", "breakfast"], ["でんしゃ", "a train"], ["としょかん", "a library"],
  ["びょういん", "a hospital"], ["びょうき", "an illness"], ["ひゃく", "a hundred"],
  ["みょうじ", "a surname"], ["りゅうがく", "studying abroad"],
  ["りょうしん", "parents"], ["りょうり", "cooking"], ["りょかん", "an inn"],
  ["りょこう", "travel"], ["じてんしゃ", "a bicycle"], ["きょうしつ", "a classroom"],
  ["きょうかしょ", "a textbook"], ["しょくどう", "a cafeteria"],
  ["びじゅつかん", "an art museum"], ["やきゅう", "baseball"],
  ["じゅうどう", "judo"], ["かいしゃ", "a company"], ["はいしゃ", "a dentist"],
  ["いしゃ", "a doctor"], ["きゃく", "a guest"], ["しゅじん", "a husband"],
  ["かしゅ", "a singer"], ["にゅういん", "a hospital stay"],
  ["しょうかい", "an introduction"], ["じんじゃ", "a shrine"],
  ["きょうかい", "a church"], ["だいがくせい", "a university student"],
  ["ちゅうがくせい", "a middle school student"], ["かんじ", "kanji"],
  ["にんぎょう", "a doll"], ["ようちえん", "a kindergarten"],
  ["しゃかい", "society"], ["じょせい", "a woman"], ["ちきゅう", "the earth"],
  ["うちゅう", "space"], ["きんじょ", "the neighborhood"], ["ばしょ", "a place"],
  ["じしょ", "a dictionary"], ["ひしょ", "a secretary"], ["しゅうかん", "a habit"],
  ["らいしゅう", "next week"], ["こんしゅう", "this week"],
  ["まいしゅう", "every week"], ["しゅうまつ", "the weekend"],
  ["べんきょう", "study"], ["とうきょう", "Tokyo"], ["きょうと", "Kyoto"],
  ["きゅうしゅう", "Kyushu"], ["じゅう", "ten"], ["ひゃくえん", "a hundred yen"],
  ["しゅうり", "a repair"], ["ちょうし", "a condition"],
  ["しょうらい", "the future"], ["きょうみ", "an interest"],

  // the longest things here, and the only ones anybody says out loud
  ["おはよう", "good morning"], ["おやすみ", "good night"],
  ["こんにちは", "hello"], ["こんばんは", "good evening"],
  ["ありがとう", "thank you"], ["さようなら", "goodbye"],
  ["すみません", "excuse me"], ["おめでとう", "congratulations"],
  ["いただきます", "before a meal"], ["ごちそうさま", "after a meal"],
  ["はじめまして", "nice to meet you"], ["どういたしまして", "you're welcome"],
  ["ごめんなさい", "I'm sorry"], ["おやすみなさい", "good night"],
  ["おかえりなさい", "welcome back"], ["おげんきですか", "how are you"],
  ["ただいま", "I'm home"], ["おねがいします", "please"],
  ["しつれいします", "excuse me"], ["だいじょうぶ", "all right"],
  ["きをつけて", "take care"], ["そうですね", "that's so"],
  ["わかりました", "understood"], ["もういちど", "once more"],
  ["またあした", "see you tomorrow"], ["またね", "see you"],
  ["おつかれさま", "good work"], ["よろしく", "regards"], ["どうぞ", "go ahead"],
  ["どうも", "thanks"], ["なるほど", "I see"], ["たぶん", "probably"],
  ["もちろん", "of course"], ["ありがとうございます", "thank you"],
  ["おはようございます", "good morning"],
];

const KATAKANA_WORDS = [
  // the short ones, which is where a katakana reader starts
  ["アイス", "ice"], ["ココア", "cocoa"], ["コース", "a course"],
  ["ケース", "a case"], ["ケーキ", "cake"], ["スキー", "skiing"],
  ["バス", "a bus"], ["パン", "bread"], ["ペン", "a pen"], ["ドア", "a door"],
  ["ビル", "a building"], ["ピザ", "pizza"], ["ノート", "a notebook"],
  ["コート", "a coat"], ["ボタン", "a button"], ["カバン", "a bag"],
  ["ズボン", "trousers"], ["テニス", "tennis"], ["ホテル", "a hotel"],
  ["トイレ", "a toilet"], ["ミルク", "milk"], ["サラダ", "a salad"],
  ["パスタ", "pasta"], ["トマト", "a tomato"], ["レモン", "a lemon"],
  ["メロン", "a melon"], ["バナナ", "a banana"], ["チーズ", "cheese"],
  ["ラジオ", "a radio"], ["テレビ", "a television"], ["カメラ", "a camera"],
  ["ピアノ", "a piano"], ["ギター", "a guitar"], ["ナイフ", "a knife"],
  ["ドイツ", "Germany"], ["カナダ", "Canada"], ["ロシア", "Russia"],
  ["インド", "India"], ["アジア", "Asia"], ["ダンス", "dance"],
  ["アニメ", "anime"], ["マンガ", "manga"], ["ゲーム", "a game"],
  ["カレー", "curry"], ["ビール", "beer"], ["ワイン", "wine"],
  ["コーラ", "cola"], ["スープ", "soup"], ["ボール", "a ball"],
  ["プール", "a swimming pool"], ["ガラス", "glass"], ["タオル", "a towel"],
  ["カード", "a card"], ["メール", "email"], ["ピンク", "pink"],
  ["ブルー", "blue"], ["グレー", "gray"], ["ゴール", "the goal"],
  ["バター", "butter"], ["ソース", "sauce"], ["イチゴ", "a strawberry"],
  ["ベルト", "a belt"], ["ボート", "a boat"], ["コーヒー", "coffee"],
  ["ドラマ", "a drama"], ["スマホ", "a smartphone"], ["クラス", "a class"],
  ["シャツ", "a shirt"], ["ニュース", "the news"], ["メニュー", "a menu"],
  ["シャワー", "a shower"], ["ハム", "ham"], ["ジャム", "jam"],
  ["ゴム", "rubber"], ["メモ", "a memo"], ["ゼロ", "zero"], ["キロ", "a kilo"],
  ["ミス", "a mistake"], ["レジ", "a register"], ["バー", "a bar"],
  ["インク", "ink"], ["オイル", "oil"], ["カラー", "color"], ["コピー", "a copy"],
  ["サイズ", "a size"], ["サイン", "a signature"], ["スーツ", "a suit"],
  ["センチ", "a centimeter"], ["ソーダ", "soda"], ["テープ", "tape"],
  ["テーマ", "a theme"], ["ドレス", "a dress"], ["ドラム", "drums"],
  ["テント", "a tent"], ["バイク", "a motorbike"], ["バンド", "a band"],
  ["ページ", "a page"], ["ベル", "a bell"], ["ホール", "a hall"],
  ["ポテト", "a potato"], ["モデル", "a model"], ["ランプ", "a lamp"],
  ["リズム", "rhythm"], ["ルール", "a rule"], ["レベル", "a level"],
  ["ロビー", "a lobby"], ["カツ", "a cutlet"], ["ジャズ", "jazz"],
  ["プリン", "pudding"], ["ハワイ", "Hawaii"], ["パリ", "Paris"],
  ["タイ", "Thailand"], ["スイス", "Switzerland"], ["ローマ", "Rome"],
  ["ソウル", "Seoul"], ["グラス", "a drinking glass"], ["グラム", "a gram"],
  ["クラブ", "a club"], ["コーチ", "a coach"], ["ポイント", "a point"],

  // and the middle-length ones
  ["タクシー", "a taxi"], ["ジュース", "juice"], ["スプーン", "a spoon"],
  ["オレンジ", "an orange"], ["アメリカ", "America"], ["イギリス", "England"],
  ["フランス", "France"], ["スペイン", "Spain"], ["スカート", "a skirt"],
  ["セーター", "a sweater"], ["カーテン", "a curtain"], ["テーブル", "a table"],
  ["スポーツ", "sport"], ["コンビニ", "a convenience store"],
  ["パソコン", "a computer"], ["ペンギン", "a penguin"], ["スケート", "skating"],
  ["カラオケ", "karaoke"], ["ラーメン", "ramen"], ["スーパー", "a supermarket"],
  ["デパート", "a department store"], ["エアコン", "air conditioning"],
  ["ライオン", "a lion"], ["パンダ", "a panda"], ["ゴリラ", "a gorilla"],
  ["キリン", "a giraffe"], ["テスト", "a test"], ["リモコン", "a remote control"],
  ["マラソン", "a marathon"], ["グリーン", "green"], ["イエロー", "yellow"],
  ["ブラウン", "brown"], ["シルバー", "silver"], ["ゴールド", "gold"],
  ["テキスト", "a textbook"], ["ジョギング", "jogging"], ["シャンプー", "shampoo"],
  ["アイロン", "an iron"], ["アパート", "an apartment"], ["アフリカ", "Africa"],
  ["アルバム", "an album"], ["イタリア", "Italy"], ["ウイスキー", "whisky"],
  ["オペラ", "an opera"], ["オムレツ", "an omelet"], ["オランダ", "the Netherlands"],
  ["ガイド", "a guide"], ["ガソリン", "gasoline"], ["カタログ", "a catalog"],
  ["カロリー", "calories"], ["キャンプ", "camping"], ["クーラー", "an air cooler"],
  ["クリーム", "cream"], ["グループ", "a group"], ["コンサート", "a concert"],
  ["サービス", "service"], ["シーツ", "sheets"], ["ジーンズ", "jeans"],
  ["ステーキ", "steak"], ["ステレオ", "a stereo"], ["ストーブ", "a heater"],
  ["スタイル", "a style"], ["スカーフ", "a scarf"], ["チーム", "a team"],
  ["トンネル", "a tunnel"], ["トランプ", "playing cards"], ["ネクタイ", "a necktie"],
  ["バケツ", "a bucket"], ["ハンカチ", "a handkerchief"], ["ブラウス", "a blouse"],
  ["メートル", "a meter"], ["モーター", "a motor"], ["ライター", "a lighter"],
  ["レコード", "a record"], ["レポート", "a report"], ["ワンピース", "a dress"],
  ["ブラジル", "Brazil"], ["メキシコ", "Mexico"], ["ロンドン", "London"],
  ["ベルリン", "Berlin"], ["モスクワ", "Moscow"], ["シドニー", "Sydney"],
  ["ゴルフ", "golf"], ["デザート", "a dessert"], ["ベーコン", "bacon"],
  ["レタス", "lettuce"], ["キャベツ", "cabbage"], ["ブドウ", "grapes"],
  ["リンゴ", "an apple"], ["アドレス", "an address"], ["サイト", "a website"],
  ["ブログ", "a blog"], ["アプリ", "an app"], ["ケータイ", "a cell phone"],
  ["デザイン", "design"], ["アイドル", "an idol"], ["スター", "a star"],
  ["ステージ", "a stage"], ["ボーカル", "vocals"], ["ポスター", "a poster"],
  ["フロント", "the front desk"], ["シングル", "a single room"],
  ["セール", "a sale"], ["バーゲン", "a bargain sale"], ["マンション", "an apartment block"],
  ["ライト", "a light"], ["ボールペン", "a ballpoint pen"], ["ホワイト", "white"],
  ["ブラシ", "a brush"], ["スピード", "speed"], ["パンク", "a flat tire"],
  ["ハンドル", "a steering wheel"], ["ブレーキ", "a brake"], ["エンジン", "an engine"],
  ["スタート", "a start"], ["メンバー", "a member"], ["サークル", "a circle"],
  ["リーダー", "a leader"], ["アイデア", "an idea"], ["チャンス", "a chance"],
  ["プラン", "a plan"], ["システム", "a system"], ["ビジネス", "business"],
  ["パート", "part-time work"], ["イベント", "an event"], ["コンテスト", "a contest"],

  // the long ones, which nobody reaches until most of the syllabary is in
  ["プレゼント", "a present"], ["クリスマス", "Christmas"],
  ["レストラン", "a restaurant"], ["バイオリン", "a violin"],
  ["ハンバーグ", "hamburg steak"], ["ヨーグルト", "yogurt"],
  ["チョコレート", "chocolate"], ["カレンダー", "a calendar"],
  ["ハンバーガー", "a hamburger"], ["エレベーター", "an elevator"],
  ["スーツケース", "a suitcase"], ["コンピューター", "a computer"],
  ["アイスクリーム", "ice cream"], ["オーストラリア", "Australia"],
  ["アナウンサー", "an announcer"], ["アクセサリー", "accessories"],
  ["アルバイト", "a part-time job"], ["エスカレーター", "an escalator"],
  ["オートバイ", "a motorcycle"], ["カウンター", "a counter"],
  ["キログラム", "a kilogram"], ["キロメートル", "a kilometer"],
  ["ソーセージ", "a sausage"], ["パスポート", "a passport"],
  ["ヘリコプター", "a helicopter"], ["アルコール", "alcohol"],
  ["インタビュー", "an interview"], ["オーケストラ", "an orchestra"],
  ["ニューヨーク", "New York"], ["バレーボール", "volleyball"],
  ["パスワード", "a password"], ["プリンター", "a printer"],
  ["プログラム", "a program"], ["スケジュール", "a schedule"],
  ["カメラマン", "a photographer"], ["パーセント", "percent"],
  ["ワイシャツ", "a dress shirt"], ["サンダル", "sandals"],
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
