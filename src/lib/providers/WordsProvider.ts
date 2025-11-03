/**
 * Interface for providing word dictionaries
 */
export interface WordsProvider {
  /**
   * Get the word dictionary
   * @returns Promise resolving to array of words
   */
  getWords(): Promise<string[]>;
  
  /**
   * Get the size of the dictionary
   */
  getSize(): number;
  
  /**
   * Get a descriptive name for this provider
   */
  getName(): string;
}
