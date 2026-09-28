import express from "express"
import adderssModel from "../../models/address.js";
import userModel from "../../models/user.js";
import { addAddressService, editAddressService } from "../../services/user/addressService.js";
import addressModel from "../../models/address.js";


export const adderssPage = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const addresses = await addressModel.find({userId : userId});

        res.render("user/address", {
            addresses
        })
    }catch(error)
    {
        console.log(`this error comes from addressPage from adder controller : ${error}`)
    }
}

export const addAndEditAddress = async (req, res) => {
    const {addressId} = req.body;

    //IF CONDITON TRUE EDIT ADDRESS, FALSE ADD NEW ADDRESS
    if(addressId){   
         console.log("EDITED OLD ADDRESS")
        
        const data = req.body;
        console.log(`user entered new data name : ${data.name}`)
        const userId = req.session.user.id;
        const result = await editAddressService(addressId, data);
        if(result){
            console.log("ADDING EDITED DATA SUCCESSFULLY");
            return res.redirect("/address")
        }else{
            console.log("ADDING EDITED DATA FAILED")
            return res.redirect("/address")
        }
    }else{
       console.log("ADDED NEW ADDRESS")
        const data = req.body;
        const userId = req.session.user.id
        console.log(`user id : ${userId}`)
        console.log(`user entered new data name : ${data.name}`)

        const returnVal = await addAddressService(userId, data);

        if(typeof returnVal == null)console.log("new user address stored failed")
            else console.log("new user address stored")

        return res.redirect("/address")
    }
}

export const deleteAddress = async (req, res) => {
    try {
        const addressId = req.body.addressId;
    const result = await addressModel.findByIdAndDelete(addressId)
    console.log(`this is the result value : ${result}`)
    if(!result){
        console.log('its null there is did not exisiting this addressId')
    }

    if(result){
        console.log("deleted successfully");
        res.redirect("/address")
    }
    } catch (error) {
        console.log(`this error comes from deleteAddress function : ${error}`)
    }
    
}