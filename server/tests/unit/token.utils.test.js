const { hashPassword, verifyPassword, generateAccessToken, verifyAccessToken, generateRandomToken, hashSha256 } = require('../../src/utils/token.utils');

describe('Security Cryptographic Utilities', () => {
  describe('Argon2 Password Hashing', () => {
    it('should hash a password and successfully verify it', async () => {
      const password = 'StrongPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$argon2id$')).toBe(true);

      const isValid = await verifyPassword(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword(hash, 'WrongPassword123!');
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Access Token Lifecycle', () => {
    it('should sign a JWT access token and correctly decode verified claims', () => {
      const payload = {
        sub: '66bc11111111111111111111',
        org: '66bc22222222222222222222',
        role: 'AGENT',
        tokenVersion: 1
      };

      const token = generateAccessToken(payload);
      expect(typeof token).toBe('string');

      const decoded = verifyAccessToken(token);
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.org).toBe(payload.org);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.tokenVersion).toBe(payload.tokenVersion);
    });

    it('should throw an error if token signature is invalid', () => {
      expect(() => {
        verifyAccessToken('invalid.jwt.token');
      }).toThrow();
    });
  });

  describe('Hashing & Random Token Generators', () => {
    it('should generate high-entropy random hex tokens', () => {
      const token1 = generateRandomToken(32);
      const token2 = generateRandomToken(32);

      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).not.toEqual(token2);
    });

    it('should deterministically produce SHA-256 digests', () => {
      const digest1 = hashSha256('sentiticket_secret_input');
      const digest2 = hashSha256('sentiticket_secret_input');
      const digest3 = hashSha256('different_input');

      expect(digest1).toEqual(digest2);
      expect(digest1).not.toEqual(digest3);
    });
  });
});
