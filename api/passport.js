'use strict'

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('./users/user.schema');
const userHelper = require('./users/user.helper')

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      }, async (email, password, done) => {
      const user = await User.findOne({ email });

      console.log('== USER:', user);
    
      if (!user) {
        return done(null, false, { message: 'Incorrect email' });
      }
    
      const result = await userHelper.verifyPassword(password, user.hashed_password);

      console.log('== RESULT:', result);
    
      if (!result) {
        return done(null, false, { message: 'Incorrect password' });
      }
    
      return done(null, user);
    })
  );
}
