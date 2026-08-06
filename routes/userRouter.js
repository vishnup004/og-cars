import express from "express";
const router = express.Router();

import { signup, verifyEmail, varifyOTP, varifyOTP2, forgetPasswordUpdate, login, resendOtp  } from "../controllers/user/userController.js";
import { isAuth, isLoggedIn } from "../middleware/userAuth.js";
import passport from "passport";

router.get("/",isLoggedIn, (req, res) =>{
    res.render("user/login")
})
router.get("/signup",isLoggedIn, (req, res) => {
    return res.render("user/signup")
})
router.post("/signup", signup); 
router.post("/verify-otp",isLoggedIn, varifyOTP)
router.get("/home",isAuth, (req, res) => {
    res.render("user/home")
})
router.get("/login",isLoggedIn, (req, res) => {
    res.render("user/login")
})
router.get("/forget", (req, res) => {
    res.render("user/forgetPassEmail")
});
router.post("/verify-email", verifyEmail)
router.post("/varify-otp2", varifyOTP2)
router.post("/login", login)
router.post("/forget-password/resend", resendOtp)
router.get("/profile",isAuth, (req, res) => {
    res.render("user/profile")
})








router.get("/auth/google", 
    passport.authenticate("google", {
        scope : ["profile", "email"]
    })
);
router.get("/auth/google/callback", 
    passport.authenticate("google", {
        failureRedirect : "/login",
    }),
    (req, res) => {
        res.redirect("/home")
    }
)

router.post("/reset-password", forgetPasswordUpdate)
export default router;