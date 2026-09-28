import multer from "multer";
import path from "path";


const storage = multer.diskStorage({
    destination : (req, file, callback) => {
        callback(null, "public/uploads/products")
    },

    filename : (req, file, callback) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        callback(null, uniqueName)
    }
})


const fileFilter = (req, file, callback) => {
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/webp" || file.mimetype === "image/jpg" || file.mimetype === "image/avif"){
        callback(null, true)
    }else{
        callback(new Error("Only image are allowed"), false)
    }
}

export const productUploads = multer({
    storage,
    fileFilter
})