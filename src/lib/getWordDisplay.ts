type WordPart = {
  content: string;
  succeed: boolean;
  mistaken: boolean;
};

export function getWordDisplay(word: string, parts: WordPart[]): string {
  let currentPartIndex = 0;
  let currentPartPosition = 0;
  const result = [];

  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    const currentPart = parts[currentPartIndex];

    if (!currentPart) break;

    if (currentPart.succeed) {
      result.push(letter);
    } else {
      result.push("_");
    }

    currentPartPosition++;
    if (currentPartPosition >= currentPart.content.length) {
      currentPartIndex++;
      currentPartPosition = 0;
    }
  }

  // Add spaces between characters, but not after succeeded parts
  const finalResult = [];
  for (let i = 0; i < result.length; i++) {
    finalResult.push(result[i]);
    if (i < result.length - 1) {
      // Don't add space after last character
      const currentChar = result[i];
      const nextChar = result[i + 1];
      // Add space if current char is underscore or next char is underscore
      if (currentChar === "_" || nextChar === "_") {
        finalResult.push(" ");
      }
    }
  }

  return finalResult.join("");
}
