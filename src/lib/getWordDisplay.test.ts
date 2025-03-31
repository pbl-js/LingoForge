import { describe, it, expect } from "vitest";
import { getWordDisplay } from "./getWordDisplay";

type WordPart = {
  content: string;
  succeed: boolean;
  mistaken: boolean;
};

describe("getWordDisplay", () => {
  it("should display all underscores when no parts are succeeded", () => {
    const word = "striving";
    const parts = [
      { content: "str", succeed: false, mistaken: false },
      { content: "ivi", succeed: false, mistaken: false },
      { content: "ng", succeed: false, mistaken: false },
    ];

    const result = getWordDisplay(word, parts);
    expect(result).toBe("_ _ _ _ _ _ _ _");
  });

  it("should show succeeded parts without spaces", () => {
    const word = "striving";
    const parts = [
      { content: "str", succeed: true, mistaken: false },
      { content: "ivi", succeed: false, mistaken: false },
      { content: "ng", succeed: true, mistaken: false },
    ];

    const result = getWordDisplay(word, parts);
    expect(result).toBe("str _ _ _ ng");
  });

  it("should handle single part words", () => {
    const word = "cat";
    const parts = [{ content: "cat", succeed: false, mistaken: false }];

    const result = getWordDisplay(word, parts);
    expect(result).toBe("_ _ _");
  });

  it("should handle single part words when succeeded", () => {
    const word = "cat";
    const parts = [{ content: "cat", succeed: true, mistaken: false }];

    const result = getWordDisplay(word, parts);
    expect(result).toBe("cat");
  });

  it("should handle empty word", () => {
    const word = "";
    const parts: WordPart[] = [];

    const result = getWordDisplay(word, parts);
    expect(result).toBe("");
  });
});
