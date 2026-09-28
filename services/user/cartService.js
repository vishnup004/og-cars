
import mongoose from "mongoose";
import { cartModel } from "../../models/cars.js";
import { categoryModal } from "../../models/category.js";
import { productModel } from "../../models/product.js";


export const createNewCart = async (data) => {
    try {
        const result = await cartModel.create({
            userId : data.userId,
            items : [{
                productId : data.prodcutId,
                productName : data.productName,
                quantity : data.quantity,
                color : data.color,
                scale : data.scale,
                image : data.image,
                price : data.price
            }]
        })
        return result;
    } catch (error) {
        
    }
}

export const updateProductQuantityService = async (userId, itemId, qty) => {
    try {
        const result = await cartModel.findOneAndUpdate(
            {
                userId, 
                "items._id" : itemId
            }, {
                "items.$.quantity" : qty
            })
        return result
    } catch (error) {
        
    }
}

export const updateCartService = async (cartId, product) => {
    try {
        const res = await cartModel.findByIdAndUpdate(cartId, {
            $push : {
                items : {
                    productId : product.productId,
                    productName : product.productName,
                    quantity : product.quantity,
                    color : product.color,
                    scale : product.scale,
                    image : product.image,
                    price : product.price
                }
            }
        })
        return res;
    } catch (error) {
        
    }
}

export const relatedProductsService = async (query, limit) => {
    try {
        const result = await productModel.find(query).limit(limit);
        return result;
    } catch (error) {
        
    }
}

export const cartItemRemoveService = async (userId, itemId) => {
    const result = await cartModel.updateOne({userId : userId, "items._id" : itemId}, {
        $pull : { 
            items : {
                _id : itemId
            }
        }
    })
    return result
};

export const cartDrawerItemRemoveService = async (itemId, userId) => {
    const result = await cartModel.updateOne(
        {
            userId,
            "items._id" : itemId
        },
        {
            $pull : {
                items : {
                    _id : itemId
                }
            }
        }
    )
    return result;
}

export const cartDrawerProductRemoveService = async (userId, productId) => {
    const result = await cartModel.updateOne(
        {
            userId : userId,
            "items.productId" : productId
        },
        {
            $pull : {
                items : {
                    productId : productId
                }
            }
        }
    )
    return result;
}

export const findCartWithFilter = async (userId, itemFilter) => {
    const result = await cartModel.findOne({userId : userId , 
        items : {
            $elemMatch : itemFilter
        }
    });
    return result
}

export const cartDrawerQtyUpdate = async (userId, itemId, qty) => {
    const result = await cartModel.updateOne({userId : userId, "items._id" : itemId}, 
        {
            $set : { "items.$.quantity" : qty}
        })
    return result;
}

export const udpateQuantityMainCartService = async (cartId, itemId, qty) => {
    const result = await cartModel.findOneAndUpdate({
        _id : new mongoose.Types.ObjectId(cartId),
        "items._id" : itemId
    },{
        $set : {
            "items.$.quantity" : qty
        }
    })
    return result ;
}