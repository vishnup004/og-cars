import express from "express";
import userModel from "../../models/user.js";
import {validatingUser,savingUserOnDB, sendOtpEmail, resetUserPassword, checkingLoginCredential} from "../../services/user/userService.js";
import bcrypt from "bcrypt";
import { generateOtp } from "../../utils/otpGeneratore.js";
    
export let signup = async (req, res) => {
    const {name, email, password} = req.body;
    try {
        console.log(name, email, password)

        let result = await validatingUser({
            name,
            email,
            password
        });    
        if(!result.success){
            return res.render("user/signup", {
                message : result.message
            })
        }; 
        const otp = await sendOtpEmail(email);
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.otp = otp;
        req.session.userData = {    
            name, 
            email,
            password
        }
        req.session.save((err) => {
            if(err){
                console.log(`this error occuring session saving in the signup function(contorller) =: ${err}`)
            }
            console.log("session saved!", req.session)
            return res.redirect("/signupOtp")
        })
    }catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};


export const varifyOTP = async (req, res) => {
    try{
        const enteredOtp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5 + req.body.otp6;
    if(Date.now() > req.session.otpExpiry){
        console.log("session otp expired")
        return res.json({
            success : false,
            message : 'Otp Expired'
        });
    }
    if(enteredOtp !== req.session.otp){
        console.log("entered otp not matched")
        return res.json({
            success : false,
            message : "Invalid OTP"
        })
    };
    const newUser = await savingUserOnDB(req.session.userData);
    req.session.user = {
        id : newUser._id,
        name : newUser.name,
        email : newUser.email,
        role : "user"
    }

    delete req.session.otp;
    delete req.session.userData;
    delete req.session.otpExpiry;

        return res.redirect("/home")

    }catch(error) {
        console.log(error)
        res.status(500).send("Something went wrong")
    }
};

export const verifyEmail = async (req, res) => {
    try{
        let email = req.body.email;
        
        let user = await userModel.findOne({email})
        if(!user){
            return res.json({
                success : false,
                message : "Email not found!"
            })
        }

        let OTP = await sendOtpEmail(email)
        req.session.otp = OTP;
        req.session.varifyEmail = email;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.userId = user._id;
        
        return res.redirect("/forgetPassOtp")
    }catch(error){
        console.log(`this error comes from verifyEmail function =: ${error}`)
        res.status(500).json({
            success : false,
            message : "Something went wrong"
        })
    }
    
}

//CHECKING OTP FOR FORGET PASSEWORD OPERATION
export const varifyOTP2 = async (req, res) => {
    try{
    let userOTP = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5 + req.body.otp6;
    if(userOTP !== req.session.otp){
        return res.json({
            success : false, 
            message : "Wrong Otp"
        })
    }
    if(Date.now() > req.session.otpExpiry){
        return res.json({
            success : false,
            message : "Remaining time was meted"
        })
    }
    if(userOTP == req.session.otp && Date.now() < req.session.otpExpiry)
    {
        return res.redirect("/resetPass")
    }
        return res.render("user/signup")
    }catch(err){
        console.log(`this error happened on verifyOTP2 function =: ${error}`)
        return {
            success : false,
            message : "internal error"
        }
    }
    
}

export const forgetPasswordUpdate = async (req, res) => {
    try{
        const {password, confirmPassword} = req.body;
        
        await resetUserPassword(password, req.session.userId) // GO TO SERVICE FILE

        return res.redirect("/home")
    }catch(err){
        console.log(`this error comes from forgetPasswordUpdate =: ${err}`)
        return {
            success : false,
            message : "Internal error"
        }
    }
}

export const login = async (req, res) => {
    try{
    const {email, password} = req.body;
    
    let result = await checkingLoginCredential(email, password)

    if(!result.success){
        return res.render("user/login", {
            success : result.success,
            message : result.message
        })
    }
    let user = await userModel.findOne({email : email})
    req.session.user = {
        id : user._id,
        name : user.name,
        email : user.email,
        role : "user",
    }

    req.session.save((err) => {
        if(err){
            console.log(`this error happened on session.save() : ${err}`)
            return res.render("user/login", {
                success : false,
                message : "Session error"
            })
        }
        return res.redirect("/home")
    })
    }catch(error){
        console.log(error);
        return res.render("user/login", {
            success : false,
            message : "Internal error"
        })
    }
}

export const resendOtp = async (req, res) => {
    const email = req.session.varifyEmail;
    
    try{
    if(!email){
        return res.status(400).json({
            success : false,
            message : "Session expired"
        })
    };

    const otp = await sendOtpEmail(email);
    req.session.otp = otp;
    req.session.otpExpiry = Date.now() + 5 * 60 * 1000
    console.log(`resent otp : ${otp}`)
        return res.render("user/forgetPassOtp")
    }catch(error){
        console.log(`this error comes from resendotp controll fun: ${error}`)
    }
}