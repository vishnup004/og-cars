import passport from "passport";
import { Strategy as GoogleStrategy} from "passport-google-oauth20";
import userModel from "../models/user.js";

passport.use(
    new GoogleStrategy(
    {
        clientID : process.env.GOOGLE_CLIENT_ID,
        clientSecret : process.env.GOOGLE_CLIENT_SECRET,
        callbackURL : process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try{
            let user = await userModel.findOne({
                googleId : profile.id
            })
            if(!user){
                user = await userModel.create({
                    googleId : profile.id,
                    name : profile.displayName,
                    email : profile.emails[0].value,
                })
            }
            done(null, user)
        }catch(error){
            done(error, null)
        }
    }
))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user)
})