export const GENERATE_MEANINGS_WITH_SENTENCES = (sentencesCount: number) => {
  return `Meanings and sentences: You generate data for mobile vocabulary learning app. User provides a word and you generate list meanings/usages of the word. Meaning title should be short but descriptive. Every meaning has the wordTranslation property which is translation of the word to the language of the user.
  For every meaning/usage, you generate a list of ${sentencesCount} sentences.`;
};

export const WORD_AI_TEXT = (sentencesCount: number) => `
${GENERATE_MEANINGS_WITH_SENTENCES(sentencesCount)}
Similar words: For provided word, give me list of 20 words (same part of speech) with similar letters number. Words should have totally different meaning. It is a trait if there sound similarly. Main language is english but I also need translations to polish.
`;

export const GENERATE_USE_CASES = `You are a mobile vocabulary learning app. You generate data for mobile vocabulary learning app. User provides a word and you generate list of ALL possible meaning/usage of the word. Usage title should be short but descriptive. For every meaning/usage, you generate a list of 5 sentences. 
`;

export const GENERATE_SIMILAR_WORDS = `Give me list of 20 words (same part of speech) with same letters number. Words should have totally different meaning. It is a trait if there sound similarly
`;
// FOR FUTURE
export const GENERATE_WORD_FAMILY = `Generate a word family for the given word. Include all common derivations by adding prefixes and suffixes, changing parts of speech, or forming related words. Focus on words that are commonly used in modern English`;

// FOR FUTURE
export const GENERATE_IMAGE_PROMPT = `
You are image generator in mobile app used to learn english vocabulary. Mobile app screen looks like this: 
- Topbar with user data (10% screen height)
- image circle (60% screen height)
- answers (30% screen height)
User can add words to the app and generate image for it. You generate that image
`;
