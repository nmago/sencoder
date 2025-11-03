/**
 * Type definitions for Word Encoder application
 */

export type ConversionMode = 'encode' | 'decode';

export type DictionarySourceType = 'built-in' | 'custom';

export interface DictionaryInfo {
  size: number;
  bitsPerWord: number;
  dictionary: string[];
}

export interface NotificationMessage {
  type: 'success' | 'error';
  message: string;
}

export interface BuiltInDictionary {
  id: string;
  title: string;
  url: string;
  size: number; // Must be a power of 2
}

export type CompressionAlgorithm = 'gzip' | 'deflate' | 'none';

export interface AppSettings {
  sourceType: DictionarySourceType;
  builtInDictionaryId?: string; // For built-in dictionaries
  customWords?: string; // For custom dictionary (comma or newline separated)
  password: string; // Password for encryption/decryption
  compressionAlgorithm: CompressionAlgorithm; // Compression algorithm
  encryptionAlgorithm: 'AES-256-CBC'; // Encryption algorithm (for future extensibility)
}
