import { ICompressor } from './ICompressor';

/**
 * Gzip compression using browser's native CompressionStream API
 */
export class GzipCompressor implements ICompressor {
  async compress(data: Uint8Array): Promise<Uint8Array> {
    // Use browser's native compression
    const stream = new Blob([data as BlobPart]).stream();
    const compressedStream = stream.pipeThrough(
      new CompressionStream('gzip')
    );
    
    const compressedBlob = await new Response(compressedStream).blob();
    const arrayBuffer = await compressedBlob.arrayBuffer();
    
    return new Uint8Array(arrayBuffer);
  }

  async decompress(compressedData: Uint8Array): Promise<Uint8Array> {
    // Use browser's native decompression
    const stream = new Blob([compressedData as BlobPart]).stream();
    const decompressedStream = stream.pipeThrough(
      new DecompressionStream('gzip')
    );
    
    const decompressedBlob = await new Response(decompressedStream).blob();
    const arrayBuffer = await decompressedBlob.arrayBuffer();
    
    return new Uint8Array(arrayBuffer);
  }

  getAlgorithmName(): string {
    return 'gzip';
  }
}
