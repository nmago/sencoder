import { EncoderService } from '../encoder/EncoderService';
import { ICompressor } from '../compression';
import { ICryptor } from '../crypto';

/**
 * Secure encoder with direct binary flow (no metadata wrapper)
 * Flow: Compress → Encrypt → Word Encode
 */
export class SecureEncoder {
  constructor(
    private encoder: EncoderService,
    private compressor: ICompressor | null,
    private cryptor: ICryptor
  ) {}

  /**
   * Initialize the encoder (delegates to the underlying encoder service)
   */
  async initialize(): Promise<void> {
    await this.encoder.initialize();
  }

  /**
   * Encode string securely (direct binary flow):
   * 1. Compress (optional)
   * 2. Encrypt
   * 3. Word encode
   * No metadata wrapper - maximum efficiency!
   */
  async encodeSecure(input: string, password: string): Promise<string> {
    console.log('🔐 [SecureEncoder] Starting encryption (direct binary flow)...');
    console.log('📝 Input length:', input.length, 'chars');
    console.log('⚙️  Compression:', this.compressor ? 'enabled' : 'disabled');
    
    // 1. Convert string to bytes
    const inputBytes = new TextEncoder().encode(input);
    console.log('1️⃣ Input bytes:', inputBytes.length, 'bytes');

    // 2. Compress (optional)
    let processedData: Uint8Array;
    if (this.compressor) {
      processedData = await this.compressor.compress(inputBytes);
      console.log('2️⃣ Compressed:', processedData.length, 'bytes', 
        `(${((processedData.length / inputBytes.length) * 100).toFixed(1)}% of original)`);
    } else {
      processedData = inputBytes;
      console.log('2️⃣ No compression applied');
    }

    // 3. Encrypt (directly, no metadata wrapper)
    const encrypted = await this.cryptor.encrypt(processedData, password);
    console.log('3️⃣ Encrypted:', encrypted.length, 'bytes');

    // 4. Word encode
    const encoded = this.encoder.encodeBits(encrypted);
    const wordCount = encoded.split(' ').length;
    console.log('4️⃣ Word encoded:', wordCount, 'words');
    console.log('✅ Encryption complete! (No metadata overhead)');

    return encoded;
  }

  /**
   * Decode string securely (reverse process):
   * 1. Word decode
   * 2. Decrypt
   * 3. Decompress (optional)
   */
  async decodeSecure(encoded: string, password: string): Promise<string> {
    console.log('🔓 [SecureEncoder] Starting decryption (direct binary flow)...');
    const wordCount = encoded.split(' ').length;
    console.log('📝 Input:', wordCount, 'words');
    console.log('⚙️  Compression:', this.compressor ? 'enabled' : 'disabled');
    
    try {
      // 1. Decode words to bytes
      const encrypted = this.encoder.decodeBits(encoded);
      console.log('1️⃣ Word decoded:', encrypted.length, 'bytes');

      // 2. Decrypt (directly, no metadata wrapper)
      const decrypted = await this.cryptor.decrypt(encrypted, password);
      console.log('2️⃣ Decrypted:', decrypted.length, 'bytes');

      // 3. Decompress (if compression was used)
      let output: Uint8Array;
      if (this.compressor) {
        output = await this.compressor.decompress(decrypted);
        console.log('3️⃣ Decompressed:', output.length, 'bytes');
      } else {
        output = decrypted;
        console.log('3️⃣ No decompression needed');
      }

      // 4. Convert bytes to string
      const result = new TextDecoder().decode(output);
      console.log('4️⃣ Final output:', result.length, 'chars');
      console.log('✅ Decryption complete! (No metadata overhead)');
      
      return result;
    } catch (error) {
      console.error('❌ [SecureEncoder] Decryption failed:', error);
      throw error;
    }
  }

  /**
   * Get information about the secure encoding process
   */
  getInfo(): {
    encoder: string;
    compressor: string | null;
    cryptor: string;
    dictionarySize: number;
    bitsPerWord: number;
  } {
    const dictInfo = this.encoder.getDictionaryInfo();
    return {
      encoder: this.encoder.getProviderName(),
      compressor: this.compressor?.getAlgorithmName() ?? null,
      cryptor: this.cryptor.getAlgorithmName(),
      dictionarySize: dictInfo.size,
      bitsPerWord: dictInfo.bitsPerWord,
    };
  }
}
