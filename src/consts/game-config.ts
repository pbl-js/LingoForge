export const AUDIO_SOUNDS = {
  correct:
    "https://ueetgnxhw203rpll.public.blob.vercel-storage.com/static-audio/correct-F9znOI93LSkcOAfSFhdy3No0KpTgl5.mp3",
  mistake:
    "https://ueetgnxhw203rpll.public.blob.vercel-storage.com/static-audio/mistake-HiOb94tgcJQgXQegOOCUv06XIQvXOD.mp3",
  gameSucceed:
    "https://ueetgnxhw203rpll.public.blob.vercel-storage.com/static-audio/game-succeed-bYbhvYAJPd97jz3MlGGa9HBcPGk95H.mp3",
  gameFailed:
    "https://ueetgnxhw203rpll.public.blob.vercel-storage.com/static-audio/game-failed-B3XDhyWqipN4L8DdftTPqgP8FsnlYv.mp3",
};

export const correctAnswerAudio = new Audio(AUDIO_SOUNDS.correct);
export const wrongAnswerAudio = new Audio(AUDIO_SOUNDS.mistake);
export const gameSucceedAudio = new Audio(AUDIO_SOUNDS.gameSucceed);
export const gameFailedAudio = new Audio(AUDIO_SOUNDS.gameFailed);
