import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        require : true
    },

    name : {
        type : String,
        required : true
    },

    phoneNumber : {
        type : String,
        require : true
    },

    addressLine : {
        type : String,
        require : true
    },

    district : {
        type : String,
        require : true
    },

    city : {
        type : String,
        require : true
    },

    state : {
        type : String,
        require : true
    },

    pincode : {
        type : String,
        require : true
    },

    label : {
        type : String,
        require : true
    },

    isDefault : {
        type : Boolean,
        require : true
    }

})

let addressModel = mongoose.model("Address", addressSchema);
export default addressModel;