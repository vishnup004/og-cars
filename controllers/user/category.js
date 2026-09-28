import { categoryModal } from "../../models/category.js";
import { productModel } from "../../models/product.js"

export const productListing = async (req, res) => {
    try {
        const limit = 5;
        const searchValue = req.query.search;
        const filterCategory = req.query.category ? req.query.category.trim() : "";
        const minPrice = req.query.minPrice ?? 0;
        const maxPrice = req.query.maxPrice ?? 0;
        const sort = req.query.sort;

        const category = await categoryModal.find({status : "active"});
        
        let query = { status : "list" };

        if(minPrice || maxPrice){
            query.price = { 
                $gte : Number(minPrice),
                $lte : Number(maxPrice)
            }
        }

        if(searchValue) {
           query.productName = {$regex : searchValue, $options : "i"}
        }

        if(filterCategory){
            query.category = filterCategory;
        }
        
        let sortQuery = {createdAt : -1};

        if(sort === "price-desc"){
            sortQuery = {price : -1}
        }
        if(sort === "price-asc"){
            sortQuery = {price : 1}
        }
        if(sort === "name-desc"){
            sortQuery = {productName : -1}
        }
        if(sort === "name-asc"){
            sortQuery = {productName : 1}
        }

        const productsCount = await productModel.countDocuments(query);
        let totalPages = Math.ceil(productsCount / limit)

        let page = parseInt(req.query.page) || 1;

        if(totalPages === 0) totalPages = 1;

        if(page > totalPages) page = totalPages
        else if(page < 1) page = 1

        const skip = (page - 1) * limit; 
        console.log("filter value :", filterCategory)
        console.log("quer :", query)
        const products = await productModel.find(query).sort(sortQuery).limit(limit).skip(skip);
       
        const ajex = req.headers["x-requested-with"] === "XMLHttpRequest";
        if(ajex){
            return res.json({
                success : true,
                products,
                currentPage : page,
                totalPage : totalPages,
                totalProduct : productsCount,
                searchValue, 
                category
            })
        }
        
        res.render("user/category" , {
            products,
            currentPage : page,
            totalPage : totalPages,
            totalProduct : productsCount,
            searchValue,
            category
        })
    } catch (error) {
        console.log("error :", error)
        // return res.status(500).json({
        //     success : false,
        //     message : "Failed to load product page"
        // })
    }
}