import CryptoJS from 'crypto-js';
import { ICryptor } from './ICryptor';

/**
 * AES-256 encryption using crypto-js
 * Uses PBKDF2 for key derivation and includes salt + IV in output
 */
export class AESCryptor implements ICryptor {
  private readonly iterations = 10000; // PBKDF2 iterations
  private readonly keySize = 256 / 32; // 256-bit key
  private readonly ivSize = 128 / 32; // 128-bit IV
  private readonly saltSize = 128 / 32; // 128-bit salt

  async encrypt(data: Uint8Array, password: string): Promise<Uint8Array> {
    console.log('🔒 [AESCryptor] Encrypting...');
    console.log('   Input data length:', data.length, 'bytes');
    
    // Generate random salt and IV
    const salt = CryptoJS.lib.WordArray.random(this.saltSize * 4);
    const iv = CryptoJS.lib.WordArray.random(this.ivSize * 4);
    console.log('   Generated salt:', this.saltSize * 4, 'bytes');
    console.log('   Generated IV:', this.ivSize * 4, 'bytes');

    // Derive key from password using PBKDF2
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: this.keySize,
      iterations: this.iterations,
    });
    console.log('   Key derived with', this.iterations, 'iterations');

    // Convert Uint8Array to WordArray
    const wordArray = this.uint8ArrayToWordArray(data);

    // Encrypt using AES-CBC
    const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Combine: salt (16 bytes) + IV (16 bytes) + ciphertext
    const ciphertext = encrypted.ciphertext;
    const combined = salt.clone()
      .concat(iv)
      .concat(ciphertext);

    // Convert to Uint8Array
    const result = this.wordArrayToUint8Array(combined);
    console.log('   Output length:', result.length, 'bytes');
    console.log('   (salt:', this.saltSize * 4, '+ IV:', this.ivSize * 4, '+ ciphertext:', result.length - 32, ')');
    
    return result;
  }

  async decrypt(encryptedData: Uint8Array, password: string): Promise<Uint8Array> {
    console.log('🔓 [AESCryptor] Decrypting...');
    console.log('   Input data length:', encryptedData.length, 'bytes');
    
    // Convert to WordArray
    const combined = this.uint8ArrayToWordArray(encryptedData);
    console.log('   Combined WordArray sigBytes:', combined.sigBytes);

    // Extract salt (first 16 bytes)
    const saltWords = CryptoJS.lib.WordArray.create(
      combined.words.slice(0, this.saltSize)
    );
    console.log('   Extracted salt:', this.saltSize * 4, 'bytes');

    // Extract IV (next 16 bytes)
    const ivWords = CryptoJS.lib.WordArray.create(
      combined.words.slice(this.saltSize, this.saltSize + this.ivSize)
    );
    console.log('   Extracted IV:', this.ivSize * 4, 'bytes');

    // Extract ciphertext (remaining bytes)
    const ciphertextLength = combined.sigBytes - (this.saltSize + this.ivSize) * 4;
    const ciphertextWords = CryptoJS.lib.WordArray.create(
      combined.words.slice(this.saltSize + this.ivSize),
      ciphertextLength
    );
    console.log('   Extracted ciphertext:', ciphertextLength, 'bytes');

    // Derive key from password using same salt
    const key = CryptoJS.PBKDF2(password, saltWords, {
      keySize: this.keySize,
      iterations: this.iterations,
    });
    console.log('   Key derived with', this.iterations, 'iterations');

    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertextWords } as any,
      key,
      {
        iv: ivWords,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    console.log('   Decrypted WordArray sigBytes:', decrypted.sigBytes);

    // Convert back to Uint8Array
    const result = this.wordArrayToUint8Array(decrypted);
    console.log('   Output length:', result.length, 'bytes');
    
    return result;
  }

  getAlgorithmName(): string {
    return 'AES-256-CBC';
  }

  /**
   * Convert Uint8Array to CryptoJS WordArray
   */
  private uint8ArrayToWordArray(uint8Array: Uint8Array): CryptoJS.lib.WordArray {
    const words: number[] = [];
    for (let i = 0; i < uint8Array.length; i += 4) {
      const word =
        (uint8Array[i] << 24) |
        (uint8Array[i + 1] << 16) |
        (uint8Array[i + 2] << 8) |
        uint8Array[i + 3];
      words.push(word);
    }
    return CryptoJS.lib.WordArray.create(words, uint8Array.length);
  }

  /**
   * Convert CryptoJS WordArray to Uint8Array
   */
  private wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const uint8Array = new Uint8Array(sigBytes);

    for (let i = 0; i < sigBytes; i++) {
      const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      uint8Array[i] = byte;
    }

    return uint8Array;
  }
}
