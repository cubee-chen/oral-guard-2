const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

// Local strategy for email/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  }, 
  async (email, password, done) => {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      
      // If user doesn't exist
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      // User authenticated
      return done(null, user);
      
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;