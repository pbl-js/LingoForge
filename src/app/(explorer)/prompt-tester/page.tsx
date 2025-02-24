'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Play } from 'lucide-react';
import {
  GENERATE_SENTENCE_PROMPT,
  GENERATE_SIMILAR_WORDS,
  GENERATE_IMAGE_PROMPT,
} from '@/consts/prompts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const prompts = [
  {
    title: 'Generate Sentences',
    description:
      'Generates sentences and usage examples for vocabulary learning',
    prompt: GENERATE_SENTENCE_PROMPT,
  },
  {
    title: 'Generate Similar Words',
    description: 'Finds similar words with the same letter count',
    prompt: GENERATE_SIMILAR_WORDS,
  },
  {
    title: 'Generate Image Prompt',
    description:
      'Creates image generation prompts for vocabulary visualization',
    prompt: GENERATE_IMAGE_PROMPT,
  },
];

export default function PromptTesterPage() {
  const [expandedPrompt, setExpandedPrompt] = React.useState<string | null>(
    null
  );
  const [copiedPrompt, setCopiedPrompt] = React.useState<string | null>(null);

  const handleCopyPrompt = async (prompt: string, title: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(title);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleRunPrompt = async (prompt: string, title: string) => {
    console.log(`Running prompt: ${title}`);
    // TODO: Implement actual prompt testing
  };

  const handleTogglePrompt = (title: string) => {
    setExpandedPrompt(expandedPrompt === title ? null : title);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-4">Project Prompts</h1>

      <div className="flex flex-col gap-4">
        {prompts.map(({ title, description, prompt }) => (
          <div
            key={title}
            className="bg-purple-900 rounded-lg overflow-hidden shadow-lg"
          >
            <button
              onClick={() => handleTogglePrompt(title)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-purple-800/50 transition-colors"
            >
              <div>
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <p className="text-purple-300 text-sm mt-1">{description}</p>
              </div>
              <span className="text-purple-300">
                {expandedPrompt === title ? '−' : '+'}
              </span>
            </button>

            {expandedPrompt === title && (
              <div className="p-4 border-t border-purple-800">
                <div className="bg-purple-950 rounded-lg p-4">
                  <pre className="text-purple-100 whitespace-pre-wrap font-mono text-sm">
                    {prompt}
                  </pre>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-purple-300 hover:text-white hover:bg-purple-800"
                      onClick={() => handleRunPrompt(prompt, title)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <TooltipProvider>
                      <Tooltip open={copiedPrompt === title}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-purple-300 hover:text-white hover:bg-purple-800"
                            onClick={() => handleCopyPrompt(prompt, title)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-green-500 text-white border-none">
                          <p>Copied to clipboard!</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
