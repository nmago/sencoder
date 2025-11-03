import { SecureEncoder } from './SecureEncoder';
import { EncoderService } from '../encoder/EncoderService';
import { ArrayWordsProvider } from '../providers';
import { GzipCompressor } from '../compression';
import { AESCryptor } from '../crypto';

/**
 * Jest test suite for SecureEncoder.
 */
describe('SecureEncoder', () => {
  let secureEncoderWithCompression: SecureEncoder;
  let secureEncoderWithoutCompression: SecureEncoder;

  // This block runs before each test, setting up the necessary objects.
  beforeEach(async () => {
    // A small dictionary for the test.
    const testDictionary = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew'];
    const provider = new ArrayWordsProvider(testDictionary, 'Test Dictionary');

    // The EncoderService handles the conversion between data and words.
    const encoder = new EncoderService(provider);
    await encoder.initialize(); // Load the dictionary.

    // The components for compression and encryption.
    const compressor = new GzipCompressor();
    const cryptor = new AESCryptor();

    // Create an instance of SecureEncoder WITH compression.
    secureEncoderWithCompression = new SecureEncoder(encoder, compressor, cryptor);
    await secureEncoderWithCompression.initialize();

    // Create an instance of SecureEncoder WITHOUT compression.
    secureEncoderWithoutCompression = new SecureEncoder(encoder, null, cryptor);
    await secureEncoderWithoutCompression.initialize();
  });

  /**
   * Test case 1: With Compression
   * Verifies that the encoder works correctly when compression is enabled.
   */
  it('should correctly encode and decode a message with compression', async () => {
    const plaintext = 'This is a secret message with compression!';
    const password = 'strong-password-123';

    // Encode and decode using the instance that has a compressor.
    const encodedText = await secureEncoderWithCompression.encodeSecure(plaintext, password);
    const decodedText = await secureEncoderWithCompression.decodeSecure(encodedText, password);

    expect(decodedText).toBe(plaintext);
    console.log('Test Passed: With Compression');
  });

  /**
   * Test case 2: Without Compression
   * Verifies that the encoder works correctly when compression is disabled.
   */
  it('should correctly encode and decode a message without compression', async () => {
    const plaintext = 'This is a secret message without compression!';
    const password = 'another-strong-password-456';

    // Encode and decode using the instance that has no compressor.
    const encodedText = await secureEncoderWithoutCompression.encodeSecure(plaintext, password);
    const decodedText = await secureEncoderWithoutCompression.decodeSecure(encodedText, password);

    expect(decodedText).toBe(plaintext);
    console.log('Test Passed: Without Compression');
  });
});
