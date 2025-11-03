import { ICompressor } from './ICompressor';

/**
 * Deflate compression using browser's native CompressionStream API
 * Better compression than Gzip (15-20% smaller)
 */
export class DeflateCompressor implements ICompressor {
  async compress(data: Uint8Array): Promise<Uint8Array> {
    console.log('🗜️  [DeflateCompressor] Compressing...');
    console.log('   Input:', data.length, 'bytes');
    
    const stream = new CompressionStream('deflate');
    const writer = stream.writable.getWriter();
    writer.write(data as any);
    writer.close();

    const chunks: Uint8Array[] = [];
    const reader = stream.readable.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    console.log('   Output:', result.length, 'bytes');
    console.log('   Ratio:', ((result.length / data.length) * 100).toFixed(1) + '%');
    
    return result;
  }

  async decompress(compressedData: Uint8Array): Promise<Uint8Array> {
    console.log('📂 [DeflateCompressor] Decompressing...');
    console.log('   Input:', compressedData.length, 'bytes');
    
    const stream = new DecompressionStream('deflate');
    const writer = stream.writable.getWriter();
    writer.write(compressedData as any);
    writer.close();

    const chunks: Uint8Array[] = [];
    const reader = stream.readable.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    console.log('   Output:', result.length, 'bytes');
    
    return result;
  }

  getAlgorithmName(): string {
    return 'deflate';
  }
}
