/**
 * Factory functions for creating encoder instances with different providers
 */
import { EncoderService } from './EncoderService';
import { createDefaultProvider, createUrlProvider, ArrayWordsProvider } from '../providers';
import type { WordsProvider } from '../providers';

/**
 * Create an encoder with the default 64-word array provider
 */
export async function createDefaultEncoder(): Promise<EncoderService> {
  const provider = createDefaultProvider();
  const encoder = new EncoderService(provider);
  await encoder.initialize();
  return encoder;
}

/**
 * Create an encoder with a URL provider
 * @param url - Full URL/path to the dictionary file
 * @param size - Dictionary size (must be a power of 2)
 * @param name - Optional descriptive name
 */
export async function createUrlEncoder(url: string, size: number, name?: string): Promise<EncoderService> {
  const provider = createUrlProvider(url, size, name);
  const encoder = new EncoderService(provider);
  await encoder.initialize();
  return encoder;
}

/**
 * Create an encoder with a custom array provider
 */
export async function createArrayEncoder(
  words: string[],
  name?: string
): Promise<EncoderService> {
  const provider = new ArrayWordsProvider(words, name);
  const encoder = new EncoderService(provider);
  await encoder.initialize();
  return encoder;
}

/**
 * Create an encoder with a custom provider
 */
export async function createCustomEncoder(provider: WordsProvider): Promise<EncoderService> {
  const encoder = new EncoderService(provider);
  await encoder.initialize();
  return encoder;
}
