const authService = require('../services/auth.service');
const env = require('../config/environment');

const COOKIE_NAME = 'sentiticket_rt';

function setRefreshTokenCookie(res, token, expiresAt) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    expires: expiresAt,
    path: '/api/v1/auth'
  });
}

function clearRefreshTokenCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    path: '/api/v1/auth'
  });
}

async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body, req.ip, req.headers['user-agent']);
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        user: result.user,
        organization: result.organization,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body, req.ip, req.headers['user-agent']);

    if (result.requiresMfa) {
      return res.status(200).json({
        success: true,
        requiresMfa: true,
        data: {
          mfaToken: result.mfaToken
        }
      });
    }

    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

    return res.status(200).json({
      success: true,
      requiresMfa: false,
      message: 'Logged in successfully',
      data: {
        user: result.user,
        organization: result.organization,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
}

async function verifyMfa(req, res, next) {
  try {
    const { mfaToken, totpCode } = req.body;
    const result = await authService.verifyMfaChallenge(mfaToken, totpCode, req.ip, req.headers['user-agent']);
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

    return res.status(200).json({
      success: true,
      message: 'MFA verified successfully',
      data: {
        user: result.user,
        organization: result.organization,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const plainToken = req.cookies[COOKIE_NAME] || req.body.refreshToken;
    const result = await authService.rotateRefreshToken(plainToken, req.ip, req.headers['user-agent']);
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

    return res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const plainToken = req.cookies[COOKIE_NAME] || req.body.refreshToken;
    await authService.logoutUser(plainToken);
    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await authService.requestPasswordReset(req.body.email, req.body.organizationSlug, req.ip);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPasswordWithToken(req.body.token, req.body.newPassword, req.ip);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user,
        organization: req.organization
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  verifyMfa,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe
};
