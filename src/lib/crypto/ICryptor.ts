/**
 * Interface for encryption/decryption operations
 */
export interface ICryptor {
  /**
   * Encrypt data with a password/key
   * @param data - Data to encrypt
   * @param password - Password or key for encryption
   * @returns Encrypted data (includes IV/nonce)
   */
  encrypt(data: Uint8Array, password: string): Promise<Uint8Array>;

  /**
   * Decrypt data with a password/key
   * @param encryptedData - Data to decrypt (includes IV/nonce)
   * @param password - Password or key for decryption
   * @returns Decrypted data
   */
  decrypt(encryptedData: Uint8Array, password: string): Promise<Uint8Array>;

  /**
   * Get the name of the encryption algorithm
   */
  getAlgorithmName(): string;
}
