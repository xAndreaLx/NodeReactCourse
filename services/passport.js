const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("../config/keys");

const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "https://intense-badlands-22064.herokuapp.com/auth/google/callback",
      proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id })
        .then(existingUser => {
          if (existingUser) {
            // we already have a record for this profile ID
            done(null, existingUser);
          } else {
            // new user with this profile ID
            new User({ googleId: profile.id })
              .save()
              .then(user => done(null, user));
          }
        })
        .catch(err => console.log("[ERROR] : " + err));
    }
  )
);
