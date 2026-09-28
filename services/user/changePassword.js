import userModel from "../../models/user.js"
import bcrypt from "bcrypt"
export const changeOldPassword = async (cPass, userId) => {
    try {
        const encryptPass = await bcrypt.hash(cPass, 10)
        const result = await userModel.findByIdAndUpdate(userId, {
            password : encryptPass
        })

        return result;
    } catch (error) {
        console.log(`this console from changeOldPassword function on service file : ${error}`)
    }
}

export const updateNewPasswordService =async (userId, hashPass) => {
    try {
        const result = await userModel.findByIdAndUpdate(userId, hashPass)
        return result;
    } catch (error) {
        
    }
}