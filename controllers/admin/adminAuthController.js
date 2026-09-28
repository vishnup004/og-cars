import express from "express";
import { isAdminAuth } from "../../middleware/adminMiddleware.js";
import userModel from "../../models/user.js";



export const adminLogin = (req, res) => {
    const {email, password} = req.body;

    if(email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD){
        req.session.adminAuth = email;

        req.session.save((err) => {
            if(err) console.log("this error happened on admin session saving function;")
        })
        return res.redirect("/admin/home")
    }
}
