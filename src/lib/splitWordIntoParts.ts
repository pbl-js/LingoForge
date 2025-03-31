/**
 * Splits a word into parts according to specific rules:
 * - Words with 2 characters: split into 1+1
 * - Words with 3 characters: split into 2+1
 * - Words with 4-5 characters: split into parts of 2, with remainder of 0-1
 * - Words with 6+ characters: split into parts of 3, with remainder of 0-2
 */
export function splitWordIntoParts(word: string): string[] {
  const length = word.length;

  // Handle empty string
  if (length === 0) return [];

  // Handle special cases for very short words
  if (length === 1) return [word];
  if (length === 2) return [word.charAt(0), word.charAt(1)]; // 1+1 split
  if (length === 3) return [word.substring(0, 2), word.charAt(2)]; // 2+1 split

  // Determine chunk size based on word length
  const chunkSize = length > 5 ? 3 : 2;

  // Split the word into chunks
  const parts: string[] = [];
  for (let i = 0; i < length; i += chunkSize) {
    // If we're at the end and have fewer characters than chunk size
    const remaining = length - i;
    if (remaining <= chunkSize) {
      parts.push(word.substring(i));
      break;
    } else {
      parts.push(word.substring(i, i + chunkSize));
    }
  }

  return parts;
}
