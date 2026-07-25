import mongoose from "mongoose";

export const connectDB = async () => {
    try{
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected SUCCESS")
    }catch(error){
        console.log("DB connected FAILED")
        console.log(error.message)
    }
}