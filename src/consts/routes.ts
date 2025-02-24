export const routes = {
  home: '/',
  wordList: '/word-list',
  wordListDetails: (id: number) => `/word-list/${id}`,
  learn: '/learn',
  promptTester: '/prompt-tester',
} as const;
