import { Room } from './types';
import { getTruths, getDares, pickPrompt } from './prompts';
import { PromptType } from './types';
import { randomInt } from './utils';

export function selectPrompt(
  room: Room,
  type: PromptType,
): { promptType: PromptType; prompt: string } {
  const truths = getTruths();
  const dares = getDares();

  if (type === 'truth') {
    const { prompt } = pickPrompt(truths, room.usedTruthIndexes);
    room.currentPromptType = 'truth';
    room.currentPrompt = prompt;
    return { promptType: 'truth', prompt };
  } else {
    const { prompt } = pickPrompt(dares, room.usedDareIndexes);
    room.currentPromptType = 'dare';
    room.currentPrompt = prompt;
    return { promptType: 'dare', prompt };
  }
}

export function selectRandom(room: Room): { promptType: PromptType; prompt: string } {
  const type: PromptType = randomInt(2) === 0 ? 'truth' : 'dare';
  return selectPrompt(room, type);
}
