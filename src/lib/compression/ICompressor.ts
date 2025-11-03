/**
 * Interface for compression/decompression operations
 */
export interface ICompressor {
  /**
   * Compress data
   * @param data - Data to compress
   * @returns Compressed data
   */
  compress(data: Uint8Array): Promise<Uint8Array>;

  /**
   * Decompress data
   * @param compressedData - Data to decompress
   * @returns Decompressed data
   */
  decompress(compressedData: Uint8Array): Promise<Uint8Array>;

  /**
   * Get the name of the compression algorithm
   */
  getAlgorithmName(): string;
}
