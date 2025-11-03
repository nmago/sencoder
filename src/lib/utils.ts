/**
 * Utility functions
 */

/**
 * Check if a number is a power of 2
 */
export function isPowerOfTwo(n: number): boolean {
  return Number.isInteger(n) && n > 0 && Number.isInteger(Math.log2(n));
}

/**
 * Get the nearest power of 2 (floor and ceil)
 */
export function getNearestPowersOfTwo(n: number): { floor: number; ceil: number } {
  if (n <= 0) {
    return { floor: 1, ceil: 1 };
  }
  
  const floor = Math.pow(2, Math.floor(Math.log2(n)));
  const ceil = Math.pow(2, Math.ceil(Math.log2(n)));
  
  return { floor, ceil };
}

/**
 * Validate dictionary size
 */
export function validateDictionarySize(size: number): { valid: boolean; message?: string } {
  if (!Number.isInteger(size) || size <= 0) {
    return { valid: false, message: 'Dictionary size must be a positive integer' };
  }
  
  if (!isPowerOfTwo(size)) {
    const { floor, ceil } = getNearestPowersOfTwo(size);
    return {
      valid: false,
      message: `Dictionary size must be a power of 2. You have ${size} words. Try ${floor} or ${ceil} words.`
    };
  }
  
  return { valid: true };
}
