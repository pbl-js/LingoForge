export const loggerRoutes = {
  rootLayout: "Layout: /",
  // rootPage: 'Page: /[locale]',
  rootPage: "Page: /",
  addWordEndpoint: "API /api/add-word",
} as const;

export type LoggerRoutesUnion = (typeof loggerRoutes)[keyof typeof loggerRoutes];
