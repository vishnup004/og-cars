
import userModel from "../../models/user.js";
import { changeOldPassword, updateNewPasswordService } from "../../services/user/changePassword.js";
import { sendOtpEmail } from "../../services/user/userService.js";
import bcrypt from "bcrypt"


export const changePassword = async (req, res) => {
    const userId = req.session.user.id;
    const {currentPassword, newPassword, confirmPassword} = req.body;
    const user = await userModel.findById({_id : userId});


    if(!user){
        return console.log("No user in session!!!!!")
    }
    const compare = await bcrypt.compare(currentPassword, user.password);

    if(!compare){
        console.log(compare)
        return res.render("user/changePassword", {
            success : false,
            message : "Incorrect password"
        })
    };

    const result = await changeOldPassword(confirmPassword, userId);
    if(!result){
        console.log("ERROR From result variable :", result)
        return res.render("user/changePassword", {
            success : false, 
            message : "Something went wrong"
        })
    }

    if(result){
        console.log("Change password successfully")
        return res.render("user/changePassword", {
            success : true,
            message : "Change password successfully"
        })
    };
};

export const getOtpPage = async (req, res) => {
    const userId = req.session.user.id;

    const user = await userModel.findById(userId)
    const otp = await sendOtpEmail(user.email);
    console.log(`created otp : ${otp}`);

    req.session.otp = otp;
    req.session.expDate = Date.now() + 5 * 60 * 1000;

    return res.render("user/otp")
};

export const vOtp = (req, res) => {
    const userOtp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5 + req.body.otp6;
    const createdOtp = req.session.otp;
    const expDate = req.session.expDate;

    if(!userOtp === createdOtp){
        return res.render("user/otp", {
            message : "Wrong otp"
        })
    };

    if(expDate < Date.now()){
        return res.render("usr/otp", {
            message : "Remaining time was meted"
        })
    };

    if(userOtp === createdOtp){
        return res.redirect("/rePassword")
    }
};

export const updateNewPass = async (req, res) => {
    const {password} = req.body;
    const userId = req.session.user.id;

    const hashed = await bcrypt.hash(password, 10)
    const result = await updateNewPasswordService(userId, hashed)

    if(!result){
        return console.log("something went wrong on updateNewPassword function restult variable")
    };
    
    console.log("password changed succesffuly");
    return res.redirect("/change-password")
};

export const rePassResendOtp = async (req, res) => {
    const email = req.session.user.email;
    const otp = await sendOtpEmail(email);

    req.session.otp = otp;
    req.session.expDate = Date.now() + 5 * 60 * 1000;

    return res.redirect("/otp")
}