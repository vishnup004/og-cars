import mongoose from "mongoose";

const cart = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId
    },

    items : [
        {
            productId : {
                type : mongoose.Schema.Types.ObjectId
            },
            productName : String,
            quantity : Number,
            color : String,
            scale : String, 
            image : String,
            price : Number
        }
    ],

    totalAmount : {
        type : String
    }
});

export const cartModel = mongoose.model("cart", cart)