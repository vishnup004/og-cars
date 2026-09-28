import bcrypt from "bcrypt";
import userModel from "../../models/user.js";
import transporter from "../../config/mail.js"
import { generateOtp } from "../../utils/otpGeneratore.js";
//import Mail from "nodemailer/lib/mailer/index.js";


export const validatingUser = async (userData) => {
    //CHECKING USER EXISTS;
    const existingUser = await userModel.findOne({email : userData.email});
    
    if(existingUser){
        return {
            success : false,
            message : "Email already exists"
        }
    }; 

    return {success : true}
};

export const savingUserOnDB = async (data) => {
    console.log("arguement of savingUserDb data : ", data)
    let hashedPass = await bcrypt.hash(data.password, 10)
    let user = new userModel({
        name : data.name,
        email : data.email,
        password : hashedPass,
    });
    user.save(); 
    return user;
}


export const sendOtpEmail = async (email) => {  //SENDER MAKEING OTP FUNCTION

    const otp = generateOtp();
    let info = await transporter.sendMail({
        from : process.env.EMAIL,
        to : email,
        subject : "Email Varification",
        text: `Your verification code is ${otp}. It expires in 5 minutes.`
    })
    return otp;
};


export const resetUserPassword = async (password, userId) => {
    try{
        let hashedPassword = await bcrypt.hash(password, 10);

        let user = await userModel.findOneAndUpdate(
            {_id : userId}, 
            { password : hashedPassword }
        );
        
        if(!user){
            console.log("user not found")
            return false;
        }
        console.log( `user exists in db : ${user}`)
        return {
            success : true,
            message : "Password updated successfully"
        }
    }catch(error){
        console.log(`this error comes from resetUserPassword function =: ${error}`)
        return {
            success : false,
            message : "Internal error"
        }
    }
    
}


export const checkingLoginCredential = async (email, password) => {
    try{
        let user = await userModel.findOne({email : email});
        
        if(!user){
            console.log("user not found")
            return {
                success : false,
                message : "User not found"
            }
        }
        if(!user.password) console.log("user password not found")

        const isTrue = await bcrypt.compare(password, user.password);

        if(!isTrue){
            return {
                success : false,
                message : "Invalid credentil"
            }
        }

        if(isTrue){
            return {
                success : true,
                message : "Login success"
            }
        }

    }catch(error){
        console.log(`this error comes from checkingLoginCredential fun from service : ${error}`)
        return {
            success : false,
            message : "Internal error"
        }
    }
}

// export default {
//     validatingAndStoring,
//     sendOtpEmail,
//     resetUserPassword
// }
