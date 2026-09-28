import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination : (req , file, cb) => {
        cb(null, "public/uploads/profile")
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName)
    }
})

const fileFilter = (req, file, cb) => {
    console.log("========== MULTER FILE ==========");
    console.log("File name:", file.originalname);
    console.log("MIME type:", file.mimetype);
    console.log("Field name:", file.fieldname);
    console.log("=================================");
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/webp" || file.mimetype === "image/jpg"){
        cb(null, true)
    }else{
        cb(new Error("Only image are allowed"), false)
    }
}

export const profileUpload = multer({
    storage,
    fileFilter
})