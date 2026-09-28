import mongoose from "mongoose";
import { cartModel } from "../../models/cars.js";
import { productModel } from "../../models/product.js";
import { relatedProductsService, cartItemRemoveService, cartDrawerItemRemoveService, cartDrawerProductRemoveService, findCartWithFilter, cartDrawerQtyUpdate, udpateQuantityMainCartService} from "../../services/user/cartService.js";
const validId = (id) => mongoose.isValidObjectId(id);

export const getCartItmes = async (req, res) => {
    const userId = req.session.user.id

    const cart = await cartModel.findOne({ userId });
    const items = cart?.items || [];

    const totalAmount = items.reduce((total, item) => {
        return total + Number(item.price) * Number(item.quantity)
    }, 0);

    return res.json({ 
        success: true,
         items,
          totalAmount
        });
};

export const getCartMainPage = async (req, res) => {
    const MAXQTY = 5;
    const cart = await cartModel.findOne({ userId: req.session.user.id });
    const limit = 9;

    const price = cart?.items?.[0]?.price;
    const query = {
            status : "list" , 
            price: { $lt: price + 10000  , $gt: price - 10000 }  
        }
    const relatedProduct = price === undefined ? [] : await relatedProductsService(query, limit)

    return res.render("user/mainCart", { 
        relatedProduct
     });
};

export const cartItemRemove = async (req, res) => {
    const userId = req.session.user.id;
    const itemId = req.params.id;
    if (!itemId){
        return res.json({ 
            success: false,
            message: "Invalid cart item"
        });
    }

    const result = await cartItemRemoveService(userId, itemId)

    if (!result.modifiedCount){
        return res.json({ 
            success: false, 
            message: "Cart item not found"
        });
    }

    return res.json({ success: true });
};


export const cartDrawerItemRemove = async (req, res) => {
    const { itemId, productId } = req.body;
    const userId = req.session.user.id;

    if (itemId) {
        const result = await cartDrawerItemRemoveService(itemId, userId)

        if (result.modifiedCount === 0) {
            return res.json({
                success: false,
                message: "Cart item not found"
            });
        }

        return res.json({
            success: true,
            message : "cart updated"
        });
    }

    if (productId) {
        const result = await cartDrawerProductRemoveService(userId, productId)

        if (result.modifiedCount === 0) {
            return res.json({
                success: false,
                message: "Cart item not found"
            });
        }

        return res.json({
            success: true,
            message : "Updated"
        });
    }

    return res.json({
        success: false,
        message: "Invalid cart item"
    });
};

export const cartDrawerUpdate = async (req, res) => {
    const { itemId, productId, quantity } = req.body;
    console.log(`console from cartDrawerUpdate : item id : ${itemId}, productid : ${productId}, quantity :${quantity}`)
    const qty = Number(quantity);

    const itemFilter = validId(itemId) ? { _id: itemId } : validId(productId) ? { productId } : null;
    if (!itemFilter){
        return res.status(400).json({ 
            success: false,
             message: "Invalid cart item"
        });
    } 

    const userId = req.session.user.id;
    const cart = await findCartWithFilter(userId, itemFilter)

    let item ;
    if(itemId && validId(itemId)){
        item = cart?.items.find((item) => {
            return String(item._id) === itemId
        })
    }
    
    if (!item){
        return res.json({ 
            success: false,
            message: "Cart item not found"
        });
    } 

    const product = await productModel.findById(item.productId);

    const variant = product?.variant?.find((entry) => entry.color === item.color && entry.scale === item.scale);
    if (!product || !variant || qty > Number(variant.stock)){
        return res.json({ 
            success: false,
            message: "Quantity greater than stock"
        });
    }

    const quantityLimit = 5;
    const itmesQuantity = cart?.items.reduce((total, item) => {
        return total + Number(item.quantity)
    }) ?? 0;

    const TOTALQUANTITY =  itmesQuantity + Number(quantity)

    if(TOTALQUANTITY > quantityLimit){
        return res.json({
            success : false,
            code: "CART_LIMIT",
            message : "Purchase limit reached"
        })
    }

    const result = await cartDrawerQtyUpdate(userId, item._id, qty)

    if (!result.modifiedCount){
        return res.json({ 
            success: false,
             message: "Cart item not found"
            });
    } 

    return res.json({ success: true, quantity: qty });
    
};

export const updateQuantityMainCart = async (req, res) => {
    const itemId = req.params.id;
    const quantity = req.body.quantity;
    const userId = req.session.user.id;

    const cart = await cartModel.findOne({userId});
    if(!cart){
        return console.log("cart not found")
    }

    const newQuantity = Number(quantity);
    const item = cart.items.id(itemId)

    if(!item){
        return console.log("item not found in the cart")
    }

    const currentTotal = cart?.items.reduce((total, item) => {
        return total + Number(item.quantity)
    }, 0) || 0;

    const newTotal = currentTotal - Number(item.quantity) + newQuantity;
    const MAXQTY = 5

    if(newTotal > MAXQTY){
        return res.json({
            success : false,
            message : "Maximum 5 items allowed in cart"
        })
    }

    const qty = Number(quantity)
    console.log(`quantity : ${qty}`)
    const ifNoDcoument = await udpateQuantityMainCartService(cart._id, item._id, qty)

    if(!ifNoDcoument){
        return console.log("update failed on update category")
    }

    console.log("udpated document :", ifNoDcoument)
    return console.log('quantity udpated!!!')
}
