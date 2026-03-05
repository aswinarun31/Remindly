const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // Check if email already registered (email/password account)
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // Link Google to existing account
                        user.googleId = profile.id;
                        user.avatar = profile.photos[0]?.value || null;
                        await user.save();
                    } else {
                        // Create new user — default role is "student"
                        // First ever user becomes admin
                        const userCount = await User.countDocuments();
                        user = await User.create({
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            googleId: profile.id,
                            avatar: profile.photos[0]?.value || null,
                            role: userCount === 0 ? "admin" : "student",
                        });
                    }
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
