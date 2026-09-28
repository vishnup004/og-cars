import addressModel from "../../models/address.js"

export const addAddressService = async (userId, data) => {
    try{
        const result = await addressModel.create({
            userId ,
            name : data.name,
            phoneNumber : data.phone,
            addressLine : data.addressLine,
            district : data.district,
            city : data.city,
            state : data.state,
            pincode : data.pincode,
            label : data.label
        });

        return result;
    }catch(err){
        console.log(`this error comes from addAddressService file : ${err}`)
    }
};

export const editAddressService = async (userId, data) => {
    try {
        const result = await addressModel.findByIdAndUpdate(userId,{
            name : data.name,
            phoneNumber : data.phoneNumber,
            addressLine : data.addressLine,
            district : data.district,
            city : data.city,
            state : data.state,
            pincode : data.pincode,
            label : data.label
        })
        return result
    } catch (error) {
        console.log(`thsi error comes from editAddrssService fucntion : ${error}`)
    }
}