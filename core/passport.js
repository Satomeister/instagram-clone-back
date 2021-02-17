const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;
const User = require("../models/user");

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (username, password, done) => {
      try {

        const user = await User.findOne({
          $or: [{ email: username }, { username: username }],
        }).populate([
          {
            path: "followers",
            select: "_id fullname username avatar",
          },
          {
            path: "following",
            select: "_id fullname username avatar",
          },
        ]).exec();

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const validate = await user.isValidPassword(password);
        if (!validate) {
          return done(null, false, { message: "Invalid email or password" });
        }

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      secretOrKey: `'${process.env.JWT_SECRET}'`,
      jwtFromRequest: ExtractJwt.fromHeader("token"),
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.data._id).populate([
          {
            path: "followers",
            select: "_id fullname username avatar",
          },
          {
            path: "following",
            select: "_id fullname username avatar",
          },
        ]).exec();
        if (user) {
          return done(null, user);
        }

        done(null, false);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
