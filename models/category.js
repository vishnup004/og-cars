import mongoose from "mongoose";

const Category = mongoose.Schema({
    name : {
        type : String,
        require : true,
        unique : true,
    },

    discription : {
        type : String,
    },

    image : {
        type : String
    },

    status : {
        type : String,
        enum : ["active", "blocked"],
        default : "active"
    }

})

export const categoryModal = mongoose.model("category", Category);