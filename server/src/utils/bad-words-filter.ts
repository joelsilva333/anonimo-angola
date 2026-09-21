import { badWords } from "./bad-word";

const substitutions: Record<string, string> = {
  "@": "a",
  "4": "a",
  "0": "o",
  "1": "i",
  "!": "i",
  $: "s",
  "3": "e",
  "+": "t",
};

function normalizeText(text: string) {
  let normalized = text.toLowerCase();
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  normalized = normalized.replace(
    /[@!$+431]/g,
    (char) => substitutions[char] || char
  );
  normalized = normalized.replace(/[\s._\-]/g, "");
  return normalized;
}

function maskWord(word: string) {
  return "*".repeat(word.length);
}

export default function badWordsFilter(text: string) {
  let filteredText = text;

  for (const badWord of badWords) {
    const normalizedBadWord = normalizeText(badWord);

    const pattern = normalizedBadWord
      .split("")
      .map((c) => `[${c}]`)
      .join("[\\s._\\-@40!$31+]*");
    const regex = new RegExp(pattern, "gi");

    filteredText = filteredText.replace(regex, (match) => maskWord(match));
  }

  return filteredText;
}
