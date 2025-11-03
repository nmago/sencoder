/**
 * Words provider that loads dictionary from a URL
 */
import type { WordsProvider } from './WordsProvider';

export class UrlWordsProvider implements WordsProvider {
  private url: string;
  private name: string;
  private cachedWords: string[] | null = null;
  private size: number;

  constructor(url: string, size: number, name?: string) {
    this.url = url;
    this.size = size;
    this.name = name || `URL Provider (${url})`;
  }

  async getWords(): Promise<string[]> {
    // Return cached words if already loaded
    if (this.cachedWords) {
      return [...this.cachedWords];
    }

    try {
      const response = await fetch(this.url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dictionary: ${response.statusText}`);
      }

      const text = await response.text();
      const words = text
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0);

      if (words.length !== this.size) {
        console.warn(
          `Expected ${this.size} words but got ${words.length} from ${this.url}`
        );
      }

      // Cache the words
      this.cachedWords = words;
      return [...words];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to load dictionary from ${this.url}: ${errorMessage}`);
    }
  }

  getSize(): number {
    return this.size;
  }

  getName(): string {
    return this.name;
  }

  /**
   * Clear the cached words (useful for testing or forcing reload)
   */
  clearCache(): void {
    this.cachedWords = null;
  }
}

/**
 * Create URL provider from a dictionary file URL
 * @param url - Full URL/path to the dictionary file
 * @param size - Dictionary size (must be a power of 2)
 * @param name - Optional descriptive name for the provider
 */
export function createUrlProvider(url: string, size: number, name?: string): UrlWordsProvider {
  if (!Number.isInteger(Math.log2(size))) {
    throw new Error(`Dictionary size must be a power of 2, got ${size}`);
  }
  return new UrlWordsProvider(url, size, name);
}
