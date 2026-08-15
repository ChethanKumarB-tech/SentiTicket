const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const crypto = require('crypto');
const env = require('../config/environment');

authenticator.options = {
  window: 1,
  step: 30
};

const ENCRYPTION_KEY = crypto.createHash('sha256').update(env.MFA_ENCRYPTION_KEY).digest();
const ALGORITHM = 'aes-256-gcm';

function encryptSecret(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decryptSecret(encryptedText) {
  const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Malformed encrypted secret format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function generateMfaSetup(email, issuer = 'SentiTicket') {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(email, issuer, secret);
  const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
  const encryptedSecret = encryptSecret(secret);

  return {
    secret,
    encryptedSecret,
    otpauthUrl,
    qrCodeDataUrl
  };
}

function verifyMfaToken(token, encryptedSecret) {
  try {
    const plainSecret = decryptSecret(encryptedSecret);
    return authenticator.verify({ token, secret: plainSecret });
  } catch (error) {
    return false;
  }
}

function generateBackupCodes(count = 8) {
  const plainCodes = [];
  const hashedCodes = [];

  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    plainCodes.push(code);
    hashedCodes.push(crypto.createHash('sha256').update(code).digest('hex'));
  }

  return { plainCodes, hashedCodes };
}

module.exports = {
  encryptSecret,
  decryptSecret,
  generateMfaSetup,
  verifyMfaToken,
  generateBackupCodes
};
