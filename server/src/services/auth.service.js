const crypto = require('crypto');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Session = require('../models/Session');
const SLAPolicy = require('../models/SLAPolicy');
const AuditLog = require('../models/AuditLog');
const SecurityEvent = require('../models/SecurityEvent');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const env = require('../config/environment');
const {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRandomToken,
  hashToken
} = require('../utils/token.utils');
const {
  generateMfaSetup,
  verifyMfaToken,
  generateBackupCodes
} = require('../utils/mfa.utils');

async function createDefaultSLAPolicy(organizationId) {
  return SLAPolicy.create({
    organizationId,
    name: 'Standard SLA Policy',
    description: 'Default priority-based response and resolution targets',
    isDefault: true,
    businessHoursOnly: true,
    priorityRules: [
      { priority: 'CRITICAL', responseTargetMinutes: 30, resolutionTargetMinutes: 120, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 },
      { priority: 'HIGH', responseTargetMinutes: 60, resolutionTargetMinutes: 240, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 },
      { priority: 'MEDIUM', responseTargetMinutes: 120, resolutionTargetMinutes: 480, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 },
      { priority: 'LOW', responseTargetMinutes: 240, resolutionTargetMinutes: 1440, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 }
    ],
    escalationRules: [
      { thresholdPercentage: 80, escalateToTier: 1, notifyRoles: ['MANAGER'] },
      { thresholdPercentage: 100, escalateToTier: 2, notifyRoles: ['MANAGER', 'ADMIN'] }
    ]
  });
}

async function createSession(user, ipAddress, userAgent, existingFamilyId = null) {
  const plainRefreshToken = generateRandomToken(40);
  const refreshTokenHash = hashToken(plainRefreshToken);
  const familyId = existingFamilyId || crypto.randomUUID();

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Session.create({
    userId: user._id,
    organizationId: user.organizationId,
    refreshTokenHash,
    familyId,
    ipAddress,
    userAgent,
    expiresAt
  });

  return { plainRefreshToken, expiresAt };
}

async function registerUser({ email, password, firstName, lastName, organizationName, organizationSlug }, ipAddress, userAgent) {
  let org;

  if (organizationSlug) {
    org = await Organization.findOne({ slug: organizationSlug.toLowerCase() });
    if (!org) {
      throw AppError.notFound('Specified organization was not found');
    }
    if (!org.settings.allowPublicRegistration) {
      throw AppError.forbidden('Public registration is not enabled for this organization');
    }
  } else {
    const orgTitle = organizationName || `${firstName}'s Team`;
    const baseSlug = orgTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
    const uniqueSlug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

    org = await Organization.create({
      name: orgTitle,
      slug: uniqueSlug
    });

    const defaultSla = await createDefaultSLAPolicy(org._id);
    org.settings.defaultSlaPolicyId = defaultSla._id;
    await org.save();
  }

  const existingUser = await User.findOne({ organizationId: org._id, email });
  if (existingUser) {
    throw AppError.conflict('An account with this email address already exists in this organization');
  }

  const hashedPassword = await hashPassword(password);
  const rawVerifyToken = generateRandomToken(32);
  const verifyTokenHash = hashToken(rawVerifyToken);

  const userCountInOrg = await User.countDocuments({ organizationId: org._id });
  const assignedRole = userCountInOrg === 0 ? 'ADMIN' : 'CUSTOMER';

  const user = await User.create({
    organizationId: org._id,
    email,
    passwordHash: hashedPassword,
    firstName,
    lastName,
    role: assignedRole,
    status: 'ACTIVE',
    emailVerified: false,
    emailVerificationToken: verifyTokenHash,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  await AuditLog.create({
    organizationId: org._id,
    actorId: user._id,
    actorRole: user.role,
    action: 'USER_REGISTERED',
    resourceType: 'USER',
    resourceId: user._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    userAgent,
    details: { email: user.email, role: user.role, orgSlug: org.slug }
  });

  const accessToken = generateAccessToken({
    sub: user._id.toString(),
    org: org._id.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion
  });

  const { plainRefreshToken, expiresAt } = await createSession(user, ipAddress, userAgent);

  return {
    user,
    organization: org,
    accessToken,
    refreshToken: plainRefreshToken,
    refreshTokenExpiresAt: expiresAt,
    verificationToken: rawVerifyToken
  };
}

async function loginUser({ email, password, organizationSlug }, ipAddress, userAgent) {
  let orgFilter = {};
  if (organizationSlug) {
    const org = await Organization.findOne({ slug: organizationSlug.toLowerCase() });
    if (!org) {
      throw AppError.unauthorized('Invalid email or password');
    }
    orgFilter.organizationId = org._id;
  }

  const user = await User.findOne({ email, ...orgFilter })
    .select('+passwordHash +mfaSecret')
    .populate('organizationId');

  if (!user) {
    await SecurityEvent.create({
      eventType: 'LOGIN_FAILED',
      severity: 'LOW',
      ipAddress,
      userAgent,
      metadata: { emailAttempt: email }
    });
    throw AppError.unauthorized('Invalid email or password');
  }

  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    const remainingMinutes = Math.ceil((user.lockoutUntil - new Date()) / 60000);
    await SecurityEvent.create({
      organizationId: user.organizationId._id,
      eventType: 'LOGIN_FAILED',
      severity: 'MEDIUM',
      userId: user._id,
      ipAddress,
      userAgent,
      metadata: { reason: 'Account locked' }
    });
    throw AppError.forbidden(`Account is temporarily locked due to repeated failed attempts. Please try again in ${remainingMinutes} minutes.`);
  }

  if (user.status === 'SUSPENDED') {
    throw AppError.forbidden('Your account has been suspended. Please contact an administrator.');
  }

  const isValidPassword = await verifyPassword(user.passwordHash, password);
  if (!isValidPassword) {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= 5) {
      user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
      user.status = 'LOCKED';

      await SecurityEvent.create({
        organizationId: user.organizationId._id,
        eventType: 'ACCOUNT_LOCKED',
        severity: 'HIGH',
        userId: user._id,
        ipAddress,
        userAgent,
        metadata: { failedAttempts: user.failedLoginAttempts }
      });
    }

    await user.save();
    throw AppError.unauthorized('Invalid email or password');
  }

  user.failedLoginAttempts = 0;
  user.lockoutUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  if (user.mfaEnabled && user.mfaSecret) {
    const mfaToken = generateAccessToken({
      sub: user._id.toString(),
      org: user.organizationId._id.toString(),
      type: 'MFA_CHALLENGE'
    });

    return {
      requiresMfa: true,
      mfaToken
    };
  }

  const accessToken = generateAccessToken({
    sub: user._id.toString(),
    org: user.organizationId._id.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion
  });

  const { plainRefreshToken, expiresAt } = await createSession(user, ipAddress, userAgent);

  await AuditLog.create({
    organizationId: user.organizationId._id,
    actorId: user._id,
    actorRole: user.role,
    action: 'USER_LOGIN',
    resourceType: 'USER',
    resourceId: user._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    userAgent
  });

  await SecurityEvent.create({
    organizationId: user.organizationId._id,
    eventType: 'LOGIN_SUCCESS',
    severity: 'LOW',
    userId: user._id,
    ipAddress,
    userAgent
  });

  return {
    requiresMfa: false,
    user,
    organization: user.organizationId,
    accessToken,
    refreshToken: plainRefreshToken,
    refreshTokenExpiresAt: expiresAt
  };
}

async function verifyMfaChallenge(mfaToken, totpCode, ipAddress, userAgent) {
  let decoded;
  try {
    decoded = jwt.verify(mfaToken, env.JWT_SECRET);
    if (decoded.type !== 'MFA_CHALLENGE') {
      throw new Error();
    }
  } catch (error) {
    throw AppError.unauthorized('Invalid or expired MFA challenge token');
  }

  const user = await User.findById(decoded.sub).select('+mfaSecret').populate('organizationId');
  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    throw AppError.unauthorized('MFA is not configured for this account');
  }

  const isValidTotp = verifyMfaToken(totpCode, user.mfaSecret);
  if (!isValidTotp) {
    await SecurityEvent.create({
      organizationId: user.organizationId._id,
      eventType: 'MFA_CHALLENGE_FAILED',
      severity: 'MEDIUM',
      userId: user._id,
      ipAddress,
      userAgent
    });
    throw AppError.unauthorized('Invalid MFA verification code');
  }

  const accessToken = generateAccessToken({
    sub: user._id.toString(),
    org: user.organizationId._id.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion
  });

  const { plainRefreshToken, expiresAt } = await createSession(user, ipAddress, userAgent);

  await SecurityEvent.create({
    organizationId: user.organizationId._id,
    eventType: 'LOGIN_SUCCESS',
    severity: 'LOW',
    userId: user._id,
    ipAddress,
    userAgent,
    metadata: { mfaPassed: true }
  });

  return {
    user,
    organization: user.organizationId,
    accessToken,
    refreshToken: plainRefreshToken,
    refreshTokenExpiresAt: expiresAt
  };
}

async function rotateRefreshToken(plainToken, ipAddress, userAgent) {
  if (!plainToken) {
    throw AppError.unauthorized('Refresh token is required');
  }

  const hashedOldToken = hashToken(plainToken);
  const session = await Session.findOne({ refreshTokenHash: hashedOldToken });

  if (!session || session.isRevoked || session.expiresAt < new Date()) {
    if (session && session.isRevoked) {
      await Session.updateMany({ familyId: session.familyId }, { isRevoked: true });
      await SecurityEvent.create({
        organizationId: session.organizationId,
        eventType: 'TOKEN_REUSE_DETECTED',
        severity: 'CRITICAL',
        userId: session.userId,
        ipAddress,
        userAgent,
        metadata: { familyId: session.familyId }
      });
      logger.warn(`[Security] Refresh token reuse detected for family ${session.familyId}`);
    }
    throw AppError.unauthorized('Session has expired or is invalid. Please log in again.');
  }

  const user = await User.findById(session.userId);
  if (!user || user.status === 'SUSPENDED' || user.status === 'LOCKED') {
    throw AppError.unauthorized('User account is suspended or no longer active');
  }

  session.isRevoked = true;
  await session.save();

  const { plainRefreshToken, expiresAt } = await createSession(user, ipAddress, userAgent, session.familyId);

  const newAccessToken = generateAccessToken({
    sub: user._id.toString(),
    org: user.organizationId.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion
  });

  return {
    accessToken: newAccessToken,
    refreshToken: plainRefreshToken,
    refreshTokenExpiresAt: expiresAt
  };
}

async function logoutUser(plainRefreshToken) {
  if (!plainRefreshToken) return;
  const hashed = hashToken(plainRefreshToken);
  await Session.findOneAndUpdate({ refreshTokenHash: hashed }, { isRevoked: true });
}

async function requestPasswordReset(email, organizationSlug, ipAddress) {
  let orgFilter = {};
  if (organizationSlug) {
    const org = await Organization.findOne({ slug: organizationSlug.toLowerCase() });
    if (org) orgFilter.organizationId = org._id;
  }

  const user = await User.findOne({ email, ...orgFilter });
  if (!user) {
    return { success: true, message: 'If an account matches this email, a reset link has been dispatched.' };
  }

  const rawResetToken = generateRandomToken(32);
  user.passwordResetToken = hashToken(rawResetToken);
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  await SecurityEvent.create({
    organizationId: user.organizationId,
    eventType: 'PASSWORD_RESET_REQ',
    severity: 'LOW',
    userId: user._id,
    ipAddress
  });

  logger.info(`[Auth] Password reset token generated for user ${user._id} (Dev Token: ${rawResetToken})`);

  return {
    success: true,
    message: 'If an account matches this email, a reset link has been dispatched.',
    devResetToken: env.NODE_ENV === 'development' ? rawResetToken : undefined
  };
}

async function resetPasswordWithToken(token, newPassword, ipAddress) {
  const hashedToken = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  }).select('+passwordHash');

  if (!user) {
    throw AppError.badRequest('Password reset token is invalid or has expired', 'INVALID_RESET_TOKEN');
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.tokenVersion += 1;
  user.failedLoginAttempts = 0;
  user.lockoutUntil = null;
  await user.save();

  await Session.updateMany({ userId: user._id }, { isRevoked: true });

  await SecurityEvent.create({
    organizationId: user.organizationId,
    eventType: 'PASSWORD_RESET_DONE',
    severity: 'MEDIUM',
    userId: user._id,
    ipAddress
  });

  return { success: true, message: 'Password has been successfully updated. You may now log in.' };
}

module.exports = {
  registerUser,
  loginUser,
  verifyMfaChallenge,
  rotateRefreshToken,
  logoutUser,
  requestPasswordReset,
  resetPasswordWithToken
};
