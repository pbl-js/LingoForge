'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Play, Loader2 } from 'lucide-react';
import {
  WORD_AI_TEXT,
  GENERATE_SIMILAR_WORDS,
  GENERATE_IMAGE_PROMPT,
} from '@/consts/prompts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { wordAiTextAction } from '@/services/wordAiText/wordAiTextAction';

const prompts = [
  {
    title: 'Word ai text' as const,
    description:
      'Generates sentences and usage examples for vocabulary learning',
    prompt: WORD_AI_TEXT,
    action: wordAiTextAction,
  },
  {
    title: 'Generate Similar Words' as const,
    description: 'Finds similar words with the same letter count',
    prompt: GENERATE_SIMILAR_WORDS,
    action: () => '',
  },
  {
    title: 'Generate Image Prompt' as const,
    description:
      'Creates image generation prompts for vocabulary visualization',
    prompt: GENERATE_IMAGE_PROMPT,
    action: () => '',
  },
] as const;

export default function PromptTesterPage() {
  const [expandedPrompt, setExpandedPrompt] = React.useState<string | null>(
    null
  );
  const [copiedPrompt, setCopiedPrompt] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [activePrompt, setActivePrompt] = React.useState<string | null>(null);

  const handleCopyPrompt = async (prompt: string, title: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(title);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleRunPrompt = async (title: (typeof prompts)[number]['title']) => {
    setActivePrompt(title);
    startTransition(async () => {
      try {
        if (title === 'Word ai text') {
          console.log('Word ai text runs');
          const res = await prompts[0].action('apprehand');
          console.log(res);
        }
        // TODO: Implement actual prompt testing
      } finally {
        setActivePrompt(null);
      }
    });
  };

  const handleTogglePrompt = (title: string) => {
    setExpandedPrompt(expandedPrompt === title ? null : title);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-4">Project Prompts</h1>

      <div className="flex flex-col gap-4">
        {prompts.map((promptItem) => (
          <div
            key={promptItem.title}
            className="bg-purple-900 rounded-lg overflow-hidden shadow-lg"
          >
            <button
              onClick={() => handleTogglePrompt(promptItem.title)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-purple-800/50 transition-colors"
            >
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {promptItem.title}
                </h2>
                <p className="text-purple-300 text-sm mt-1">
                  {promptItem.description}
                </p>
              </div>
              <span className="text-purple-300">
                {expandedPrompt === promptItem.title ? '−' : '+'}
              </span>
            </button>

            {expandedPrompt === promptItem.title && (
              <div className="p-4 border-t border-purple-800">
                <div className="bg-purple-950 rounded-lg p-4">
                  <pre className="text-purple-100 whitespace-pre-wrap font-mono text-sm">
                    {promptItem.prompt}
                  </pre>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-purple-300 hover:text-white hover:bg-purple-800"
                      onClick={() => handleRunPrompt(promptItem.title)}
                      disabled={isPending && activePrompt === promptItem.title}
                    >
                      {isPending && activePrompt === promptItem.title ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <TooltipProvider>
                      <Tooltip open={copiedPrompt === promptItem.title}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-purple-300 hover:text-white hover:bg-purple-800"
                            onClick={() =>
                              handleCopyPrompt(
                                promptItem.prompt,
                                promptItem.title
                              )
                            }
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
