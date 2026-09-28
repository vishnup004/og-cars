import mongoose from "mongoose";
import { stdin } from "process";
import { stringify } from "querystring";

const product = mongoose.Schema({
    productName : {
        type : String,
        required : true,
        unique : true
    },

    category : {
        type : String,
        required : true
    },

    // colores : {
    //     type : [String],
    //     required : true
    // },

    // stock : {
    //     type : Number,
    //     required : true,
    //     min : 0,
    //     default : 0
    // },

    price : {
        type : Number,
        required : true
    },

    discription : {
        type : String,
        required : true
    },

    motorType : {
        type : String,
        required : true
    },

    chassisMaterial : {
        type : String,
        required : true
    },

    // scale : {
    //     type : String,
    //     required : true
    // },

    images : {
        type : [String],
        min : 0
    },

    status : {
        type : String,
        enum : ["list" , "unlist"],
        default : "list"
    },

    variant : [
       {
        color : String,
        scale : String,
        stock : Number
       }
    ]
});

export const productModel = mongoose.model("product", product)