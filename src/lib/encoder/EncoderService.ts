/**
 * Encoder Service that uses a WordsProvider for dictionary
 */
import type { WordsProvider } from '../providers';
import type { DictionaryInfo } from '../../types';

export class EncoderService {
  private provider: WordsProvider;
  private dictionary: string[] | null = null;
  private wordToIndex: Map<string, number> | null = null;
  private bitsPerWord: number = 0;

  constructor(provider: WordsProvider) {
    this.provider = provider;
  }

  /**
   * Initialize the encoder by loading the dictionary
   */
  async initialize(): Promise<void> {
    this.dictionary = await this.provider.getWords();
    
    // Validate dictionary size is a power of 2
    const size = this.dictionary.length;
    if (!Number.isInteger(Math.log2(size))) {
      throw new Error(`Dictionary size must be a power of 2, got ${size}`);
    }

    this.bitsPerWord = Math.log2(size);
    
    // Create reverse mapping
    this.wordToIndex = new Map();
    this.dictionary.forEach((word, index) => {
      this.wordToIndex!.set(word, index);
    });
  }

  /**
   * Ensure the encoder is initialized
   */
  private ensureInitialized(): void {
    if (!this.dictionary || !this.wordToIndex) {
      throw new Error('Encoder not initialized. Call initialize() first.');
    }
  }

  /**
   * Convert string to array of bytes
   */
  private stringToBytes(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }

  /**
   * Convert array of bytes to string
   */
  private bytesToString(bytes: Uint8Array): string {
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  /**
   * Convert byte array to binary string
   */
  private bytesToBinary(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(byte => byte.toString(2).padStart(8, '0'))
      .join('');
  }

  /**
   * Convert binary string to byte array
   */
  private binaryToBytes(binary: string): Uint8Array {
    const bytes: number[] = [];
    for (let i = 0; i < binary.length; i += 8) {
      const chunk = binary.slice(i, i + 8);
      if (chunk.length === 8) {
        bytes.push(parseInt(chunk, 2));
      }
    }
    return new Uint8Array(bytes);
  }

  /**
   * Encode bits to words using the dictionary
   * Prepends the original byte length to preserve exact data
   */
  encodeBits(bytes: Uint8Array): string {
    this.ensureInitialized();

    if (!bytes || bytes.length === 0) {
      return '';
    }

    // Prepend the original length (4 bytes = 32 bits) to preserve exact byte count
    const lengthBytes = new Uint8Array(4);
    new DataView(lengthBytes.buffer).setUint32(0, bytes.length, false); // big-endian
    
    // Combine length + data
    const combined = new Uint8Array(lengthBytes.length + bytes.length);
    combined.set(lengthBytes, 0);
    combined.set(bytes, lengthBytes.length);

    // Convert bytes to binary string
    const binary = this.bytesToBinary(combined);

    // Split into chunks and map to words
    const words: string[] = [];
    for (let i = 0; i < binary.length; i += this.bitsPerWord) {
      let chunk = binary.slice(i, i + this.bitsPerWord);

      // Pad the last chunk if necessary
      if (chunk.length < this.bitsPerWord) {
        chunk = chunk.padEnd(this.bitsPerWord, '0');
      }

      const index = parseInt(chunk, 2);
      words.push(this.dictionary![index]);
    }

    return words.join(' ');
  }

  /**
   * Decode words back to bits
   * Reads the length prefix to extract exact byte count
   */
  decodeBits(encodedText: string): Uint8Array {
    this.ensureInitialized();

    if (!encodedText || encodedText.trim() === '') {
      return new Uint8Array(0);
    }

    // Split into words
    const words = encodedText.trim().split(/\s+/);

    // Convert words to binary
    let binary = '';
    for (const word of words) {
      const index = this.wordToIndex!.get(word);
      if (index === undefined) {
        throw new Error(`Unknown word in dictionary: "${word}"`);
      }
      binary += index.toString(2).padStart(this.bitsPerWord, '0');
    }

    // Convert binary to bytes (including padding)
    const allBytes = this.binaryToBytes(binary);
    
    // Read the length prefix (first 4 bytes)
    if (allBytes.length < 4) {
      throw new Error('Invalid encoded data: too short to contain length prefix');
    }
    
    const dataLength = new DataView(allBytes.buffer, allBytes.byteOffset, 4).getUint32(0, false);
    
    // Extract the actual data (skip the 4-byte length prefix)
    if (allBytes.length < 4 + dataLength) {
      throw new Error(`Invalid encoded data: expected ${4 + dataLength} bytes, got ${allBytes.length}`);
    }
    
    return allBytes.slice(4, 4 + dataLength);
  }

  /**
   * Encode a string to word-encoded format
   */
  encodeString(text: string): string {
    if (!text) {
      return '';
    }

    const bytes = this.stringToBytes(text);
    return this.encodeBits(bytes);
  }

  /**
   * Decode word-encoded format back to string
   */
  decodeString(encodedText: string): string {
    if (!encodedText || encodedText.trim() === '') {
      return '';
    }

    const bytes = this.decodeBits(encodedText);
    return this.bytesToString(bytes);
  }

  /**
   * Get dictionary information
   */
  getDictionaryInfo(): DictionaryInfo {
    this.ensureInitialized();

    return {
      size: this.dictionary!.length,
      bitsPerWord: this.bitsPerWord,
      dictionary: [...this.dictionary!]
    };
  }

  /**
   * Get the provider name
   */
  getProviderName(): string {
    return this.provider.getName();
  }
}
