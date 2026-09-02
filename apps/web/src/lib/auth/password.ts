import crypto from 'crypto';

/**
 * Hash a plaintext password using PBKDF2 with SHA-512 and a random 16-byte salt.
 * Formats output as `<salt>:<derivedKeyHex>`.
 */
export function hashPassword(password: string): string {
  if (!password) {
    throw new Error('Password cannot be empty');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a plaintext password against a stored PBKDF2 hash using constant-time comparison.
 * Prevents timing attacks and strictly rejects unhashed or blank passwords.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) {
    return false;
  }

  // Reject placeholder unhashed values
  if (!storedHash.includes(':')) {
    return false;
  }

  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    return false;
  }

  const [salt, key] = parts;
  if (!salt || !key) {
    return false;
  }

  try {
    const hashBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');

    if (hashBuffer.length !== derivedKey.length) {
      return false;
    }

    return crypto.timingSafeEqual(hashBuffer, derivedKey);
  } catch {
    return false;
  }
}
