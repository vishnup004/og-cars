import express from "express";
import { profileUpload } from "../../config/profileMulter.js";
import passport from "passport";
const router = express.Router();

import { signup, verifyEmail, varifyOTP, varifyOTP2, forgetPasswordUpdate, login, signupResendOtp, forgetPassResendOtp  } from "../../controllers/user/userController.js";
import { isAuth, isLoggedIn, requireVerifiedForgetPassOtp } from "../../middleware/userAuth.js";
import { profilePage, uploadProfileImage , editProfile, verifyEmailOtp, logout } from "../../controllers/user/profile.js";
import { adderssPage, addAndEditAddress, deleteAddress } from "../../controllers/user/address.js";
import { changePassword, getOtpPage, vOtp, updateNewPass, rePassResendOtp} from "../../controllers/user/changePassword.js";
import { productListing } from "../../controllers/user/category.js";
import { productPage } from "../../controllers/user/product.js";
import { addToCart } from "../../controllers/user/product.js";
import { getCartItmes, cartItemRemove, getCartMainPage, cartDrawerItemRemove, cartDrawerUpdate, updateQuantityMainCart } from "../../controllers/user/cart.js";



router.get("/",isLoggedIn, (req, res) => res.render("user/login"))
router.get("/signup",isLoggedIn, (req, res) =>  res.render("user/signup"))
router.post("/signup", signup); 
router.post("/verify-otp",isLoggedIn, varifyOTP)
router.get("/home",isAuth, (req, res) => res.render("user/home"))
router.get("/signupOtp",isLoggedIn, (req, res) => res.render("user/signupOtp"))
router.get("/login",isLoggedIn, (req, res) => res.render("user/login"))
router.get("/forget",isLoggedIn, (req, res) => res.render("user/forgetPassEmail"));
router.post("/verify-email",isLoggedIn, verifyEmail)
router.post("/verify-otp2",isLoggedIn, varifyOTP2)
router.get("/resetPass",isLoggedIn, requireVerifiedForgetPassOtp, (req, res) => res.render("user/resetPass"))
router.post("/login",isLoggedIn, login)
router.post("/signup/resendOtp",isLoggedIn, signupResendOtp)
router.post("/forgetPassOtp/resendOtp",isLoggedIn, forgetPassResendOtp)
router.post("/reset-password",isLoggedIn, requireVerifiedForgetPassOtp, forgetPasswordUpdate)
router.post("/profile/upload",
    profileUpload.single("profileImage"),
    uploadProfileImage
)
router.get("/profile", isAuth, profilePage)
router.patch("/edit-profile",isAuth, editProfile)
router.post("/change/email/otp", verifyEmailOtp)
router.get("/forgetPassOtp",isLoggedIn,(req, res) => {
    if (!req.session.forgetPassOtp || Date.now() > req.session.forgetPassOtpExpiry) {
        return res.redirect("/forget");
    }
    res.render("user/forgetPassOtp");
})
router.post("/logout",isAuth,logout)

router.get("/address", isAuth, adderssPage)
router.post("/add/address",isAuth, addAndEditAddress)
router.delete("/address/delete", isAuth, deleteAddress)

router.get("/change-password",isAuth, (req, res) => res.render("user/changePassword"));
router.post("/change-password",isAuth, changePassword);
router.get("/change-password/forgot-password",isAuth, getOtpPage);
router.post("/v-otp", isAuth, vOtp);
router.get("/rePassword", isAuth, (req, res) => res.render("user/rePassword"));
router.post("/resetPass", isAuth, updateNewPass);
router.post("/rePassword/resendOtp", isAuth, rePassResendOtp);
router.get("/otp", isAuth, (req, res) => res.render("user/otp"))

router.get("/auth/google", 
    passport.authenticate("google", {
        scope : ["profile", "email"]
    })
);
router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login"
    }),
    (req, res) => {

        console.log(`req.user : ${req.user}`)
        req.session.user = {
            id : req.user._id,
            name : req.user.name,
            email : req.user.email,
            role : "user"
        }
        req.session.save((err) => {
            if (err) {
                console.log("SESSION SAVE ERROR:", err);
                return res.redirect("/login");
            }

            console.log("Google login session created");
            console.log("SESSION USER:", req.session.user);

            res.redirect("/home");
        });
    }
);

router.get("/category",isAuth, productListing);
router.get("/product/:productId",isAuth, productPage);
router.post("/cart/add",isAuth, addToCart)
router.get("/cart",isAuth, getCartItmes);
router.get("/mainCart",isAuth, getCartMainPage);
router.delete("/cart/remove/:id",isAuth, cartItemRemove)
router.post("/cartDrawer",isAuth, cartDrawerItemRemove)
router.post("/cartDrawer/update",isAuth, cartDrawerUpdate)
router.patch("/cart/update/:id", isAuth, updateQuantityMainCart)

router.get("/user/wishlist" , (req, res) => res.render("user/wishList"))


export default router;
