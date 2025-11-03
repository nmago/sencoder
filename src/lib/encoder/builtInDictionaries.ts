/**
 * Built-in dictionary configurations
 * 
 * To add dictionaries for other languages (e.g., English), simply add new entries:
 * {
 *   id: 'english-1024',
 *   title: 'English: 1,024 random words',
 *   url: '/dictionaries/base_english_1024.txt',
 *   size: 1024
 * }
 */
import type { BuiltInDictionary } from '../../types';

export const BUILT_IN_DICTIONARIES: BuiltInDictionary[] = [
  {
    id: 'russian-64',
    title: 'Русский: 64 слова (базовый)',
    url: '/dictionaries/base_russian_64.txt',
    size: 64
  },
  {
    id: 'russian-512',
    title: 'Русский: 512 случайных слов',
    url: '/dictionaries/base_russian_512.txt',
    size: 512
  },
  {
    id: 'russian-4096',
    title: 'Русский: 4,096 случайных слов',
    url: '/dictionaries/base_russian_4096.txt',
    size: 4096
  },
  {
    id: 'russian-32768',
    title: 'Русский: 32,768 случайных слов',
    url: '/dictionaries/base_russian_32768.txt',
    size: 32768
  },
  {
    id: 'russian-65536',
    title: 'Русский: 65,536 случайных слов',
    url: '/dictionaries/base_russian_65536.txt',
    size: 65536
  }
];

/**
 * Get a built-in dictionary by ID
 */
export function getBuiltInDictionary(id: string): BuiltInDictionary | undefined {
  return BUILT_IN_DICTIONARIES.find(dict => dict.id === id);
}

/**
 * Get the default built-in dictionary
 */
export function getDefaultBuiltInDictionary(): BuiltInDictionary {
  return BUILT_IN_DICTIONARIES[0]; // Russian 64 words
}
