export const routes = {
  home: "/",
  wordList: "/word-list",
  topics: "/topics",
  wordListDetails: (id: number) => `/word-list/${id}`,
  play: "/play",
  promptTester: "/prompt-tester",
} as const;
