/**
 * Default encoder instance using ArrayWordsProvider
 * For backward compatibility and simple usage
 */

import { EncoderService } from './EncoderService';
import { createDefaultProvider } from '../providers';
import type { DictionaryInfo } from '../../types';

// Create default encoder service with 64 Russian words
const defaultProvider = createDefaultProvider();
const defaultEncoder = new EncoderService(defaultProvider);

// Initialize immediately
let initPromise: Promise<void> | null = null;

function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = defaultEncoder.initialize();
  }
  return initPromise;
}

/**
 * Encode a string to word-encoded format
 * Uses default 64-word Russian dictionary
 */
export async function encodeString(text: string): Promise<string> {
  await ensureInitialized();
  return defaultEncoder.encodeString(text);
}

/**
 * Decode word-encoded format back to string
 * Uses default 64-word Russian dictionary
 */
export async function decodeString(encodedText: string): Promise<string> {
  await ensureInitialized();
  return defaultEncoder.decodeString(encodedText);
}

/**
 * Get dictionary information
 */
export async function getDictionaryInfo(): Promise<DictionaryInfo> {
  await ensureInitialized();
  return defaultEncoder.getDictionaryInfo();
}

// Re-export for advanced usage
export { EncoderService } from './EncoderService';
export * from '../providers';
