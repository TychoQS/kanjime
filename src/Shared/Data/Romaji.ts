const ROMAJI_SYLLABLES: ReadonlyArray<readonly [string, string]> = [
  ["kyo", "きょ"],
  ["kyu", "きゅ"],
  ["kya", "きゃ"],
  ["sho", "しょ"],
  ["shu", "しゅ"],
  ["sha", "しゃ"],
  ["cho", "ちょ"],
  ["chu", "ちゅ"],
  ["cha", "ちゃ"],
  ["ryo", "りょ"],
  ["ryu", "りゅ"],
  ["rya", "りゃ"],
  ["gyo", "ぎょ"],
  ["gyu", "ぎゅ"],
  ["gya", "ぎゃ"],
  ["byo", "びょ"],
  ["byu", "びゅ"],
  ["bya", "びゃ"],
  ["pyo", "ぴょ"],
  ["pyu", "ぴゅ"],
  ["pya", "ぴゃ"],
  ["nyo", "にょ"],
  ["nyu", "にゅ"],
  ["nya", "にゃ"],
  ["hyo", "ひょ"],
  ["hyu", "ひゅ"],
  ["hya", "ひゃ"],
  ["myo", "みょ"],
  ["myu", "みゅ"],
  ["mya", "みゃ"],
  ["ja", "じゃ"],
  ["ju", "じゅ"],
  ["jo", "じょ"],
  ["shi", "し"],
  ["chi", "ち"],
  ["tsu", "つ"],
  ["fu", "ふ"],
  ["ka", "か"],
  ["ki", "き"],
  ["ku", "く"],
  ["ke", "け"],
  ["ko", "こ"],
  ["sa", "さ"],
  ["su", "す"],
  ["se", "せ"],
  ["so", "そ"],
  ["ta", "た"],
  ["te", "て"],
  ["to", "と"],
  ["na", "な"],
  ["ni", "に"],
  ["nu", "ぬ"],
  ["ne", "ね"],
  ["no", "の"],
  ["ha", "は"],
  ["hi", "ひ"],
  ["he", "へ"],
  ["ho", "ほ"],
  ["ma", "ま"],
  ["mi", "み"],
  ["mu", "む"],
  ["me", "め"],
  ["mo", "も"],
  ["ya", "や"],
  ["yu", "ゆ"],
  ["yo", "よ"],
  ["ra", "ら"],
  ["ri", "り"],
  ["ru", "る"],
  ["re", "れ"],
  ["ro", "ろ"],
  ["wa", "わ"],
  ["wo", "を"],
  ["ga", "が"],
  ["gi", "ぎ"],
  ["gu", "ぐ"],
  ["ge", "げ"],
  ["go", "ご"],
  ["za", "ざ"],
  ["ji", "じ"],
  ["zu", "ず"],
  ["ze", "ぜ"],
  ["zo", "ぞ"],
  ["da", "だ"],
  ["de", "で"],
  ["do", "ど"],
  ["ba", "ば"],
  ["bi", "び"],
  ["bu", "ぶ"],
  ["be", "べ"],
  ["bo", "ぼ"],
  ["pa", "ぱ"],
  ["pi", "ぴ"],
  ["pu", "ぷ"],
  ["pe", "ぺ"],
  ["po", "ぽ"],
  ["a", "あ"],
  ["i", "い"],
  ["u", "う"],
  ["e", "え"],
  ["o", "お"],
  ["n", "ん"]
];

const KATAKANA_OFFSET = 0x60;

/**
 * Converts a simple romaji query into kana variants used by local search.
 *
 * @param term User-entered search term.
 * @returns Distinct variants including the original term and kana forms.
 *
 * @pre term is a user search query.
 * @post Returned values are trimmed and suitable for SQLite LIKE queries.
 */
export function createSearchTermVariants(term: string): ReadonlyArray<string> {
  const normalizedTerm = term.trim().toLowerCase();

  if (normalizedTerm.length === 0) {
    return [];
  }

  const hiragana = romanizeToHiragana(normalizedTerm);
  const variants = new Set<string>([term.trim(), normalizedTerm]);

  if (hiragana.length > 0 && hiragana !== normalizedTerm) {
    variants.add(hiragana);
    variants.add(toKatakana(hiragana));
  }

  return [...variants].filter(variant => variant.length > 0);
}

/**
 * Converts supported romaji syllables to hiragana.
 *
 * @param term Lowercase romaji term.
 * @returns Hiragana text when the term can be transliterated.
 *
 * @post Unknown characters are preserved so partial terms remain searchable.
 */
function romanizeToHiragana(term: string): string {
  let remaining = term;
  let output = "";

  while (remaining.length > 0) {
    const doubledConsonant = remaining.length >= 2 &&
      remaining[0] === remaining[1] &&
      !"aeioun".includes(remaining[0]);

    if (doubledConsonant) {
      output += "っ";
      remaining = remaining.slice(1);
      continue;
    }

    const matchedSyllable = ROMAJI_SYLLABLES.find(([romaji]) => remaining.startsWith(romaji));

    if (!matchedSyllable) {
      output += remaining[0];
      remaining = remaining.slice(1);
      continue;
    }

    output += matchedSyllable[1];
    remaining = remaining.slice(matchedSyllable[0].length);
  }

  return output;
}

/**
 * Converts hiragana to katakana.
 *
 * @param hiragana Hiragana text.
 * @returns Katakana text.
 *
 * @post Characters outside the hiragana block are preserved.
 */
function toKatakana(hiragana: string): string {
  return [...hiragana].map(character => {
    const codePoint = character.codePointAt(0);

    if (codePoint === undefined || codePoint < 0x3041 || codePoint > 0x3096) {
      return character;
    }

    return String.fromCodePoint(codePoint + KATAKANA_OFFSET);
  }).join("");
}
