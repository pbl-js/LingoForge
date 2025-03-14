import { Language, Translation } from "@prisma/client";

export function getMatchTranslation(translations: Translation[], language: Language) {
  const translation = translations.find((t) => t.language === language);

  if (!translation) {
    throw new Error(`No translation found for language: ${language}`);
  }

  return translation;
}
