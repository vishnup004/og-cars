import { disconnect } from "mongoose";
import { categoryModal } from "../../models/category.js";
import { productModel } from "../../models/product.js";
import path from "path";


export const getCategoryPage = async (req, res) => {
   try {
        let page = req.query.page
        const limit = 4;

        const totalCategory = await categoryModal.countDocuments();
        const totalPage = Math.ceil(totalCategory / limit);

        if(page > totalPage) page = totalPage;
        const skip = (page - 1) * limit;
        
        const category = await categoryModal.find().limit(limit).skip(skip);
        if(!category){
            return console.log(`No category`)
        };
        
        return res.render("admin/category", {
            category : category,
            currentPage : page,
            limit,
            totalCategory,
            totalPage,
            
        })
   } catch (error) {
    console.log(`this error comes from getCategoryPage : ${error}`)
   }
};

export const addNewCategory = async (req, res) => {
    try {
        console.log("Body :", req.body); 
        console.log("FIle :", req.file)
        const {categoryName, categoryDescription} = req.body;

        const imagePath = req.file ? `/uploads/category/${req.file.filename}` : "";

        console.log(`IMAGE PATH : ${req.file.path}`)

        const result = await categoryModal.create({
            name : categoryName,
            discription : categoryDescription,
            image : imagePath,
        })

        if(!result){
            return res.json({
                success : false,
                message : "Failed to store category"
            })
        }

        return res.json({
            success : true,
            message : "Category added"
        })
    } catch (error) {
        console.log(`this error occured by addNewCategory function : ${error}`)
    }
}  

export const editNewCategory = async (req, res) => {
    try {
        const {categoryId, categoryName, categoryDescription} = req.body;

        const bodyResult = await categoryModal.findByIdAndUpdate(categoryId, {
            name : categoryName,
            discription : categoryDescription
        })

        const imgPath = req.file ? req.file.path.replace("public", "") : "";
        let imgResult = undefined;

        if(req.file){
            imgResult = await categoryModal.findByIdAndUpdate(categoryId, {
                image : imgPath
            })
        }

        if(bodyResult || imgResult){
            return res.json({
                success : true,
                message : "Updated successfully"
            })
        }
    } catch (error) {
        console.log(`this error from editNewCategory function : ${error}`);
    }
};

export const deleteCategory = async (req, res) => {
    const categoryId = req.params.id;

    const result = await categoryModal.findByIdAndDelete(categoryId);

    if(!result)return res.json({
        success : false,
        message : "Delete category failed"
    })

    return res.json({
        success : true,
        message : "Delete category successfull"
    })
}

export const list = async (req, res) =>  {
    const categoryId = req.params.id;
    console.log(`categoryId : ${categoryId}`);

    const result = await categoryModal.findByIdAndUpdate(categoryId, {
        status : "active"
    });

    if(!result) return res.json({
        success : false,
        message : "active status failed"
    });

    return res.json({
        success : true,
        message : "active status success"
    })
}

export const unlist = async (req, res) =>  {
    const categoryId = req.params.id;
    console.log(`categoryId : ${categoryId}`);

    const result = await categoryModal.findByIdAndUpdate(categoryId, {
        status : "blocked"
    });

    if(!result) return res.json({
        success : false,
        message : "blocked status failed"
    });

    return res.json({
        success : true,
        message : "blocked status success"
    })
};

export const searchCategory = async (req, res) => {
    const {search , page} = req.query;

    const searchResult = await categoryModal.find({ name : {$regex : search , $options : "i"} })

    if(!searchResult && searchResult.length === 0){
        return res.json({
            success : false,
            message : "there no category"
        })
    };

    return res.json({
        success : true,
        categories : searchResult
    })
};

export const filterCategory = async (req, res) => {
    console.log("funciton is hited")
    const {minPrice, maxPrice, brand, page} = req.query;
    console.log("user applayed filter values : ", minPrice, maxPrice, brand, page);

}