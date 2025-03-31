import { describe, it, expect } from "vitest";
import { splitWordIntoParts } from "./splitWordIntoParts";

describe("splitWordIntoParts", () => {
  // Test case for 1-character word
  it("should return the word as is for 1-character word", () => {
    expect(splitWordIntoParts("a")).toEqual(["a"]);
  });

  // Test cases for 2-character words
  it("should split 2-character word into 1+1", () => {
    expect(splitWordIntoParts("hi")).toEqual(["h", "i"]);
    expect(splitWordIntoParts("no")).toEqual(["n", "o"]);
  });

  // Test cases for 3-character words
  it("should split 3-character word into 2+1", () => {
    expect(splitWordIntoParts("cat")).toEqual(["ca", "t"]);
    expect(splitWordIntoParts("dog")).toEqual(["do", "g"]);
  });

  // Test cases for 4-5 character words (should split into parts of 2)
  it("should split 4-character word into 2+2", () => {
    expect(splitWordIntoParts("book")).toEqual(["bo", "ok"]);
    expect(splitWordIntoParts("fish")).toEqual(["fi", "sh"]);
  });

  it("should split 5-character word into 2+2+1", () => {
    expect(splitWordIntoParts("house")).toEqual(["ho", "us", "e"]);
    expect(splitWordIntoParts("apple")).toEqual(["ap", "pl", "e"]);
  });

  // Test cases for 6+ character words (should split into parts of 3)
  it("should split 6-character word into 3+3", () => {
    expect(splitWordIntoParts("banana")).toEqual(["ban", "ana"]);
    expect(splitWordIntoParts("guitar")).toEqual(["gui", "tar"]);
  });

  it("should split 7-character word into 3+3+1", () => {
    expect(splitWordIntoParts("bicycle")).toEqual(["bic", "ycl", "e"]);
    expect(splitWordIntoParts("example")).toEqual(["exa", "mpl", "e"]);
  });

  it("should split 8-character word into 3+3+2", () => {
    expect(splitWordIntoParts("computer")).toEqual(["com", "put", "er"]);
    expect(splitWordIntoParts("elephant")).toEqual(["ele", "pha", "nt"]);
  });

  it("should split 9-character word into 3+3+3", () => {
    expect(splitWordIntoParts("breakfast")).toEqual(["bre", "akf", "ast"]);
    expect(splitWordIntoParts("chocolate")).toEqual(["cho", "col", "ate"]);
  });

  it("should handle longer words correctly", () => {
    expect(splitWordIntoParts("encyclopedia")).toEqual(["enc", "ycl", "ope", "dia"]);
    expect(splitWordIntoParts("extraordinary")).toEqual(["ext", "rao", "rdi", "nar", "y"]);
  });

  // Edge cases
  it("should handle empty string", () => {
    expect(splitWordIntoParts("")).toEqual([]);
  });

  it("should handle words with special characters", () => {
    expect(splitWordIntoParts("café")).toEqual(["ca", "fé"]);
    expect(splitWordIntoParts("naïve")).toEqual(["na", "ïv", "e"]);
  });
});
