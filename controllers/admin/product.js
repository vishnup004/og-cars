import { productModel } from "../../models/product.js";
import { categoryModal } from "../../models/category.js";

const getVariants = (value) => {
    try {
        const variants = JSON.parse(value || "[]");
        return variants.filter((variant) =>
            variant.color?.trim() && variant.scale?.trim() &&
            Number.isFinite(Number(variant.stock)) && Number(variant.stock) >= 0
        ).map((variant) => ({
            color: variant.color.trim(),
            scale: variant.scale.trim(),
            stock: Number(variant.stock)
        }));
    } catch {
        return [];
    }
};

export const getAddProductPage = async (req, res) => {
    try {
        const categories = await categoryModal.find({ status: "active" }).sort({ name: 1 });
        return res.render("admin/addNewProduct", { categories });
    } catch (error) {
        console.error("Unable to load add product page:", error);
        return res.status(500).send("Unable to load the add product page");
    }
};

export const getEditProductPage = async (req, res) => {
    try {
        const [product, categories] = await Promise.all([
            productModel.findById(req.params.id),
            categoryModal.find({ status: "active" }).sort({ name: 1 })
        ]);

        if (!product) return res.redirect("/admin/product");

        return res.render("admin/addNewProduct", { categories, product });
    } catch (error) {
        console.error("Unable to load edit product page:", error);
        return res.redirect("/admin/product");
    }
};

export const listProduct = async (req, res) => {
    let page = req.query.page  || 1;
    const limit = 6;
    
    const totalProduct = await productModel.countDocuments();
    const totalPages = Math.max(1, Math.ceil(totalProduct / limit))

    if(page > totalPages) page = totalPages;
    else if(page <= 0) page = 1;

    const skip = (page - 1) * limit   
    const products = await productModel.find().limit(limit).skip(skip);
    return res.render("admin/product", {
        products : products,
        currentPage : page,
        limit,
        skip,
        totalProduct,
        totalPages
    })
}

    export const addProduct = async (req, res) => {
        try {
            const {
                productName,
                productDescription,
                productCategory,
                productPrice,
                productMotorType,
                productChassisMaterial,
                productVariants
            } = req.body;

            if (!productName?.trim() || !productDescription?.trim() || !productCategory ||
                productPrice === "" || !productMotorType?.trim() || !productChassisMaterial?.trim()) {
                return res.status(400).json({ success: false, message: "Please fill in all product details" });
            }

            const variants = getVariants(productVariants);
            if (Number(productPrice) < 0 || !variants.length) {
                return res.status(400).json({ success: false, message: "Enter a valid price and at least one variant" });
            }

            const isExists = await productModel.findOne({
                productName : productName.trim()
            })
            
            if(isExists) {
                return res.json({
                    success : false,
                    message : "Product name is already taken"
                })
            }
            const images = [];

            const MAX_IMAGES = 3;
            for (let i = 1; i <= MAX_IMAGES; i++) {
            const name = `productImage${i}`;
            if (req.files?.[name]) {
                images.push(`/uploads/products/${req.files[name][0].filename}`);
            }
            }

            if (images.length < 3) {
                return res.status(400).json({ success: false, message: "Please upload at least three product images" });
            }
        
            const result = await productModel.create({
                productName : productName.trim(),
                discription : productDescription.trim(),
                category : productCategory,
                price : Number(productPrice),
                motorType : productMotorType.trim(),
                chassisMaterial : productChassisMaterial.trim(),
                variant : variants,
                images : images
            });

            if(!result){
                return res.status(500).json({ success : false, message : "Something went wrong" })
            }

            return res.status(201).json({ success : true, message : "Product added successfully" })
        } catch (error) {
            console.error("Unable to add product:", error);
            return res.status(500).json({ success: false, message: "Unable to add product" });
        }
    };

    export const editProduct = async (req, res) => {
        // console.log("requst params: ",req.params.id)
        // console.log("request body: ", req.body);
        // console.log("request files: ", req.files);
        
        const isExists = await productModel.findById(req.params.id);
        if(!isExists){
            return res.json({
                success : false,
                message : "Product not found"
            })
        }

        const MAX_IMAGES = 3;
        const images = [...isExists.images];
        console.log("exists images : ", images); 

        for (let i = 1; i <= MAX_IMAGES; i++) {
            const field = `productImage${i}`;
            if (req.files?.[field]) {
                images[i - 1] = `/uploads/products/${req.files[field][0].filename}`;
            }
        }

        const variants = getVariants(req.body.productVariants);
        if (!variants.length) {
            return res.status(400).json({ success: false, message: "Add at least one valid variant" });
        }

        const result = await productModel.findByIdAndUpdate(req.params.id, {
            productName : req.body.productName,
            discription : req.body.productDescription,
            category : req.body.productCategory,
            price : req.body.productPrice,
            motorType : req.body.productMotorType,
            chassisMaterial : req.body.productChassisMaterial,
            variant : variants,
            images : images
        });

        if(!result){
            return res.status(500).json({
                success : false,
                message : "Something went wrong"
            })
        }

        return res.status(200).json({
            success : true,
            message : "Saved success"
        })
        
    };

export const deleteProduct = async (req, res) => {
    const productId = req.params.id;

    const result  = await productModel.findByIdAndDelete(productId);

    if(!result){
        return res.json({
            success : false,
            message : "Delete failed"
        })
    }

    return res.json({
        success : true,
        message : "Delete success"
    })
};

export const active = async (req, res) => {
    const productId = req.params.id;
    const result = await productModel.findByIdAndUpdate(productId, {
        status : "list"
    });

    if(!result){
        return res.json({
            success : false,
            message : "listing failed"
        })
    };

    return res.json({
        success : true,
        messsaga : "listing success"
    })
};

export const block = async (req, res) => {
    const productId = req.params.id;
    const result = await productModel.findByIdAndUpdate(productId, {
        status : "unlist"
    });

    if(!result){
        return res.json({
            success : false,
            message : "unlist failed"
        })
    };

    return res.json({
        success : true,
        messsaga : "unlist success"
    })
}
