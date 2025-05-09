export const AUDIO_SOUNDS = {
  correctAnswer:
    "https://ueetgnxhw203rpll.public.blob.vercel-storage.com/static-audio/good-response-7HD43Bmb34uXzONnaNm599g1sjNPyU.mp3",
  wrongAnswer:
    "https://ueetgnxhw203rpll.public.blob.vercel-storage.com/static-audio/bad-response-dR2nZYhAhRHzqBNvT4fHGwvlDIRUqo.mp3",
  newWord:
    "https://ueetgnxhw203rpll.public.blob.vercel-storage.com/static-audio/new-K2BWLhJEHqdBL6G3W7MxPGyumRUXO0.mp3",
};

export const correctAnswerAudio = new Audio(AUDIO_SOUNDS.correctAnswer);
export const wrongAnswerAudio = new Audio(AUDIO_SOUNDS.wrongAnswer);
