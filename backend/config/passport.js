const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { getUserByGoogleId, createUser } = require("../models/User"); // Import MySQL functions

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
  ? `${process.env.GOOGLE_CALLBACK_URL}/api/auth/google/callback`
  : "http://localhost:3000/api/auth/google/callback" },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 🔹 Check if user exists in MySQL database
        let user = await getUserByGoogleId(profile.id);

        // 🔹 If user doesn't exist, create a new one
        if (!user) {
          await createUser(profile.id, profile.displayName, profile.emails[0].value, profile.photos[0].value);
          user = await getUserByGoogleId(profile.id); // Fetch newly created user
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// 🔹 Store user in session (Only store user ID to avoid large session storage)
passport.serializeUser((user, done) => {
  done(null, user.google_id);
});

// 🔹 Retrieve user from session
passport.deserializeUser(async (googleId, done) => {
  try {
    const user = await getUserByGoogleId(googleId);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
