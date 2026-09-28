import mongoose from "mongoose";
import { productModel } from "../../models/product.js";
import { cartModel } from "../../models/cars.js";
import { updateProductQuantityService, updateCartService, createNewCart } from "../../services/user/cartService.js";
import { relatedProductService } from "../../services/user/productService.js";

export const productPage = async (req, res) => {
    const productId = req.params.productId;
    
    // if (!mongoose.isValidObjectId(productId)) return res.redirect("/category");

    const product = await productModel.findById(productId);

    if (!product || product.status === "unlist"){
        return res.redirect("/category");
    } 

    const variants = product.variant || [];
    const clrs = [...new Set(variants.map((variant) => variant.color))];
    const price = product.price;

    const query = {
        category: product.category,
        $and: [{ price: { $lt: price + 10000 } }, { price: { $gt: price - 10000 } }]
    }

    const relatedProducts = await relatedProductService(query)

    res.render("user/product", { 
        product,
        clrs, 
        variants,
        relatedProducts 
    });
};

export const addToCart = async (req, res) => {
    const { productId, quantity, color, scale } = req.body;
    const userId = req.session.user.id;
    const qty = Number(quantity);

    if (!mongoose.isValidObjectId(productId)){
        return res.json({ 
            success: false,
            message: "Invalid product" 
        });
    } 

    const product = await productModel.findById(productId);
    if (!product || product.status === "unlist"){
        return res.json({ 
            success: false, 
            message: "Product not found" 
        });
    } 

    const selectedColor = typeof color === "string" ? color : "";
    const selectedScale = typeof scale === "string" ? scale : "";
    const selectedVariant = product.variant?.find((variant) =>
        variant.color === selectedColor && variant.scale === selectedScale
    );
    if (!selectedVariant) {
        return res.json({ 
            success: false, 
            message: "Please select a valid variant" 
        });
    }
    const cart = await cartModel.findOne({ userId });  

    const existingItem = cart?.items.find((item) =>
        String(item.productId) === productId && item.color === selectedColor && item.scale === selectedScale
    );

    if (Number(existingItem?.quantity || 0) + qty > Number(selectedVariant.stock)) {
        return res.json({ 
            success: false, 
            message: "Quantity greater than stock" 
        });
    }
    
    const LIMIT = cart?.items.reduce((total, item) => {
        return total + Number(item.quantity)
    },0) ?? 0;  
    console.log("LIMIT :", LIMIT)

    const NEWTOTAL = LIMIT + qty;

    let updatedCart;
    if(NEWTOTAL > 5){
        // if (existingItem) {
        //     updatedCart = await cartModel.findOneAndUpdate({ userId, "items._id": existingItem._id },{ $inc: { "items.$.quantity": qty }});
        // } 
        return res.json({
            success : false,
            code : "CART_LIMIT",
            message : "Maximum purchase limit reached. You can purchase up to 5 items at a time."
        })
    }

    
    if (existingItem) {
        updatedCart = await updateProductQuantityService(userId, existingItem._id, qty);
        if(!existingItem){
            return res.json({
                success : false , 
                message : "update failed"
            })  
        }
        return res.json({
            success : true, 
            message : "exists cart item updated"
        })
    } 
    
    if(cart){
        const obj = {
            productId : productId, 
            productName : product.productName, 
            quantity : qty, 
            color : selectedColor, 
            scale : selectedScale, 
            image : product.images?.[0] || "", 
            price : product.price
        }
        updatedCart = await updateCartService(cart._id, obj)
    }
    
    if(!cart){
        const obj = {
            userId,
            productId,
            productName : product.productName,
            quantity : qty,
            color : selectedColor,
            scale : selectedScale,
            image : product.images?.[0] || "",
            price : product.price
        }
        const result = await createNewCart(obj)
    }

    return res.json({
        success: true,
        message: existingItem ? "Product updated" : "Product added to cart",
        items: updatedCart.items
    });
};
