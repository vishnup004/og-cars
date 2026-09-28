import userModel from "../../models/user.js";
import { editProfile } from "../../controllers/user/profile.js";


export const updateNewData = async (userId, userData) => {
    try{
        
        let res = await userModel.findByIdAndUpdate(userId, {
            name : userData.name,
            email : userData.email,
            phoneNumber : userData.phone
        });
        return res;
    }catch(err){
        console.log(`this error happened on updateNewData function profile service file : ${err}`)
    }
}  

export const profileImageUploadService = async (userId, imageFile) => {
    try {
     const result = await userModel.findByIdAndUpdate(userId, imageFile)
     return result
    } catch (error) {
        
    }
}