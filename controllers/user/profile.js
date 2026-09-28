import express from "express";
import userModel from "../../models/user.js";
import { generateOtp } from "../../utils/otpGeneratore.js";
import { updateNewData, profileImageUploadService } from "../../services/user/profile.js";
import { sendOtpEmail } from "../../services/user/userService.js";

export const profilePage = async (req, res) => {
    const userId = req.session.user.id;
    const value = await userModel.findById(userId)
   
    if(!value){
        return res.redirect("/login")
    }
    return res.render("user/profile", {
        value
    })
}

export const uploadProfileImage = async (req, res) => {
    try{
        const userId = req.session.user.id;

        if(!req.file){
            console.log("THERE IS NO IMAGE ON FOLDER")
        }

        const res = await profileImageUploadService(userId, `/uploads/profile/${req.file.filename}`)
        if(!res)return console.log("profie image upload failed")

        res.redirect("/profile")
    }catch(error){
        console.log(`this error occuring from uploadProfileImage : ${error}`)
    }
}

export const editProfile = async (req, res) => {
    try{ 
        const userData = req.body;
        const userId = req.session.user.id;

        console.log(`user entered data : ${userData.name}`)
        console.log(`user entered data : ${userData.phone}`)
        console.log(`user entered data : ${userData.email}`)
        const user = await userModel.findById(userId)

        if(!user){
            console.log('saving failed')
            return res.redirect("/profile");
        };

        const emailChanged = user.email !== userData.email ? true : false ;

        if(!emailChanged){
            const result = await updateNewData(userId, {
                name : userData.name,
                phone : userData.phone
            })

            if(!result){
                console.log("saving changed data failed")
                return res.redirect("/profile")
            }
            console.log("changed data saved")
            return res.redirect('/profile')
        }

        const existsUser = await userModel.findOne({email : userData.email})

        if(existsUser){
            return res.render("user/profile", {
                value : user,
                success : false, 
                message : "This email already taken",
                showOtpModal : false
            });
        }
        const otp = await sendOtpEmail(userData.email)

        req.session.changedEmailOtp = otp;
        req.session.emailExp = Date.now() + 5 * 60 * 1000;
        req.session.pendingEmail = userData.email;
        req.session.pendingProfile = {
            name : userData.name,
            phone : userData.phone
        }

        return res.render("user/profile", {
            value : user,
            showOtpModal : true,
            otpError: ""
        })
    }catch(err){
        console.log('this error comes from editProfile function : ', err);
        return res.redirect("/profile")
    }
}


export const verifyEmailOtp = async (req, res) => {
    try { 
        const userId = req.session.user.id;
        const otp = req.body.otp;
        if(req.session.changedEmailOtp !== otp){
            return res.render("user/profile", {
                success : false,
                otpError : "Wrong otp",

            })
        }
        if(req.session.emailExp < Date.now()){
            return res.render("user/profile", {
                success : false,
                otpError : "Otp expired"
            })
        }

        console.log('same otp!!!!');

        const result = await updateNewData(userId, {
            name : req.session.pendingProfile.name,
            phone : req.session.pendingProfile.phone,
            email : req.session.pendingEmail
        })
        if(!result) console.log("DANGER SAVING EMAIL")
        if(result) console.log("EMAIL AND OTHER DATA STORING SUCCESSFULLY");
        
        return res.redirect("/profile")
    }catch(err){
        console.log(`this error comes from verifyEmailOtp funcion : ${err}`)
    }
}

export const logout = (req, res) => {
    console.log("logout funtion hited")
    req.session.destroy((err) => {
        if(err){
            console.log(`this consoling from session destroy method : ${err}`)
        };

        res.clearCookie("connect.sid");
        return res.redirect("/login")
    })
}