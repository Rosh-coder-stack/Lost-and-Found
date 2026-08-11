const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

/**
 * Configure Passport Google OAuth 2.0 Strategy (Stateless / Sessionless for JWT)
 */
const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/v1/auth/google/callback';

  if (!clientID || !clientSecret || clientID === 'your_google_client_id_here') {
    console.warn('⚠️ Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are missing or using placeholders in .env.');
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID || 'DUMMY_CLIENT_ID',
        clientSecret: clientSecret || 'DUMMY_CLIENT_SECRET',
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract email from profile
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase().trim() : null;

          if (!email) {
            return done(null, false, { message: 'No email address found in Google profile' });
          }

          // 1. Check if user already exists by email
          let user = await User.findOne({ email });

          if (user) {
            // 2. If user exists with provider="local", handle account conflict gracefully
            if (user.provider === 'local') {
              return done(null, false, {
                code: 'ACCOUNT_CONFLICT',
                message: 'An account with this email already exists using password login. Please log in with your email and password.',
              });
            }

            // If user exists with provider="google", ensure googleId is set and return user
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }

            return done(null, user);
          }

          // 3. If user does not exist, create a new user with provider="google"
          const name =
            profile.displayName ||
            `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() ||
            'Google User';

          user = await User.create({
            name,
            email,
            provider: 'google',
            googleId: profile.id,
          });

          return done(null, user);
        } catch (error) {
          console.error(`Google Strategy Error: ${error.message}`);
          return done(error, null);
        }
      }
    )
  );
};

module.exports = configurePassport;
