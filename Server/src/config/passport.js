import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Constants from '../constant.js';
import { userModel } from '../models/user.schema.js';

passport.use(new GoogleStrategy({
    clientID: Constants.GOOGLE_CLIENT_ID,
    clientSecret: Constants.GOOGLE_CLIENT_SECRET,
callbackURL: "https://code-mart-eight.vercel.app/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
        let user = await userModel.findOneAndUpdate({ googleId: profile.id });

        if (!user) {
            user = await userModel.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
            })
        }
        return cb(null, user);
    } catch (error) {
        console.log(error);
        return cb(error, null)
    }
  }
));