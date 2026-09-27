import { randomInt } from './utils';

// Prompts are embedded here so the server has no file-system dependency at runtime.
// They mirror the content in the frontend's data/ text files.

const TRUTHS: string[] = [
  "What is something that always makes you smile?",
  "What is your favorite childhood memory?",
  "What is your favorite song right now?",
  "What is something you want to learn?",
  "What is the funniest thing that happened to you recently?",
  "What is one thing you are proud of?",
  "What is your favorite food?",
  "What is something that makes you happy?",
  "What is a hobby you would like to try?",
  "What is your favorite movie?",
  "If you could travel anywhere, where would you go?",
  "What is a skill you wish you had?",
  "Who is someone that inspires you?",
  "What is your favorite season and why?",
  "What is the best gift you have ever received?",
  "What is something you have always wanted to try?",
  "What is your favorite thing about yourself?",
  "What is a random fun fact you know?",
  "What is your go-to comfort food?",
  "What is a movie that always makes you laugh?",
  "If you could have any superpower, what would it be?",
  "What is the most adventurous thing you have ever done?",
  "What is your favorite book or story?",
  "What is something you are looking forward to?",
  "What is a talent you have that not many people know about?",
  "If you could only eat one food forever, what would it be?",
  "What is the best advice anyone has ever given you?",
  "What is something that always cheers you up?",
  "What was your favorite game as a child?",
  "What is one thing on your bucket list?",
];

const DARES: string[] = [
  "Send your funniest emoji combination.",
  "Describe your day using exactly three words.",
  "Make your best dramatic movie reaction.",
  "Write your name using emojis.",
  "Make a funny face for five seconds.",
  "Send a funny GIF.",
  "Say a random sentence dramatically.",
  "Describe your favorite food without saying its name.",
  "Create a silly nickname for yourself.",
  "Do your best impression of a robot.",
  "Speak in a funny accent for the next 30 seconds.",
  "Say the alphabet as fast as you can.",
  "Name five animals that start with the letter B.",
  "Do your best superhero pose.",
  "Describe your current mood using only animal sounds.",
  "Invent a new word and use it in a sentence.",
  "Tell a one-sentence story that starts with 'Once upon a time...'",
  "Do your best impression of a game show host.",
  "Describe your perfect day in exactly ten words.",
  "Make up a short jingle about your favorite snack.",
  "Give the person to your left a compliment.",
  "Pretend you are a news reporter and describe what is happening around you.",
  "Spell out your name using only body shapes.",
  "Do your best impression of a famous cartoon character.",
  "List five things you can see right now.",
  "Make up a handshake and teach it to the group.",
  "Describe what you are wearing as if it is a fashion show.",
  "Say three nice things about yourself.",
  "Pretend you are a chef and describe your signature dish.",
  "Do your best impression of a sportscaster.",
];

export function getTruths(): string[] {
  return TRUTHS;
}

export function getDares(): string[] {
  return DARES;
}

/**
 * Pick a random index that has not been used yet.
 * If all indexes are used, reset and start over.
 */
export function pickPrompt(
  prompts: string[],
  usedIndexes: Set<number>,
): { prompt: string; index: number } {
  if (usedIndexes.size >= prompts.length) {
    usedIndexes.clear();
  }

  let index: number;
  let attempts = 0;
  do {
    index = randomInt(prompts.length);
    attempts++;
    // Fallback: if we somehow can't find an unused one quickly, just take the first unused
    if (attempts > prompts.length * 2) {
      for (let i = 0; i < prompts.length; i++) {
        if (!usedIndexes.has(i)) {
          index = i;
          break;
        }
      }
      break;
    }
  } while (usedIndexes.has(index));

  usedIndexes.add(index);
  return { prompt: prompts[index], index };
}
