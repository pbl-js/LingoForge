'use server';

import OpenAI from 'openai';
import React from 'react';

const openai = new OpenAI();

const oaiGenerateSentence = React.cache((sentence: string) =>
  openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'developer',
        content:
          'You generate 10 sentences for word provided by user. These sentences are used to learn vocabulary in mobile application.',
      },
      {
        role: 'user',
        content: sentence,
      },
    ],
    // response_format: {
    //   // See /docs/guides/structured-outputs
    //   type: 'json_schema',
    //   json_schema: {
    //     name: 'generated_sentences',
    //     schema: {
    //       type: 'object',
    //       properties: {
    //         email: {
    //           description: 'The email address that appears in the input',
    //           type: 'string',
    //         },
    //       },
    //       additionalProperties: false,
    //     },
    //   },
    // },
    // store: true,
  })
);

export async function generateSentenceAction() {
  // Mutate data
  const res = await oaiGenerateSentence('apprehend');
  return res.choices[0].message;
}
