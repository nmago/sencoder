/**
 * Words provider that uses a static array
 */
import type { WordsProvider } from './WordsProvider';

export class ArrayWordsProvider implements WordsProvider {
  private words: string[];
  private name: string;

  constructor(words: string[], name: string = 'Array Provider') {
    this.words = words;
    this.name = name;
  }

  async getWords(): Promise<string[]> {
    return [...this.words];
  }

  getSize(): number {
    return this.words.length;
  }

  getName(): string {
    return this.name;
  }
}

// Default 64-word Russian dictionary
export const DEFAULT_RUSSIAN_DICTIONARY: readonly string[] = [
  'солнце', 'луна', 'звезда', 'небо', 'земля', 'вода', 'огонь', 'ветер',
  'дерево', 'цветок', 'трава', 'камень', 'гора', 'река', 'море', 'океан',
  'лес', 'поле', 'дорога', 'мост', 'дом', 'окно', 'дверь', 'стена',
  'книга', 'перо', 'бумага', 'слово', 'буква', 'число', 'время', 'день',
  'ночь', 'утро', 'вечер', 'год', 'месяц', 'неделя', 'час', 'минута',
  'человек', 'друг', 'семья', 'мать', 'отец', 'брат', 'сестра', 'дитя',
  'сердце', 'душа', 'разум', 'мысль', 'чувство', 'любовь', 'радость', 'мир',
  'сила', 'свет', 'тень', 'путь', 'жизнь', 'смерть', 'правда', 'ложь'
] as const;

/**
 * Create default array provider with 64 Russian words
 */
export function createDefaultProvider(): ArrayWordsProvider {
  return new ArrayWordsProvider([...DEFAULT_RUSSIAN_DICTIONARY], 'Default 64 Russian Words');
}
