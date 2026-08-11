const passport = require('passport');
const { generateToken } = require('./authController');

/**
 * @desc    Initiate Google OAuth 2.0 authentication flow
 * @route   GET /api/v1/auth/google
 * @access  Public
 */
const googleAuth = (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })(req, res, next);
};

/**
 * @desc    Google OAuth 2.0 callback endpoint
 * @route   GET /api/v1/auth/google/callback
 * @access  Public
 */
const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    // Handle server / OAuth errors
    if (err) {
      console.error(`Google Auth Callback Error: ${err.message}`);
      return res.status(500).json({
        success: false,
        message: 'Google authentication failed due to server error',
        error: err.message,
      });
    }

    // Handle authentication failure or account conflict
    if (!user) {
      const message = info && info.message ? info.message : 'Google authentication failed';
      const isConflict = info && info.code === 'ACCOUNT_CONFLICT';
      const statusCode = isConflict ? 409 : 400;

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      // If request originates from browser navigation (HTML), redirect to frontend login with error query param
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        const redirectUrl = new URL('/login', frontendUrl);
        redirectUrl.searchParams.append('error', message);
        return res.redirect(redirectUrl.toString());
      }

      // JSON response for API clients / testing
      return res.status(statusCode).json({
        success: false,
        message,
      });
    }

    // 1. Generate JWT token using existing token generator
    const token = generateToken(user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // 2. Return JWT to frontend
    // If request originates from browser navigation, redirect to frontend with token and user details
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      const redirectUrl = new URL('/oauth-success', frontendUrl);
      redirectUrl.searchParams.append('token', token);
      if (user.name) redirectUrl.searchParams.append('name', user.name);
      if (user.email) redirectUrl.searchParams.append('email', user.email);
      if (user._id) redirectUrl.searchParams.append('id', user._id.toString());
      return res.redirect(redirectUrl.toString());
    }

    // JSON response fallback for API tools / mobile clients
    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
      },
    });
  })(req, res, next);
};

module.exports = {
  googleAuth,
  googleAuthCallback,
};
