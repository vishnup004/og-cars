import express from "express";
const router = express.Router();
import { adminLogin } from "../../controllers/admin/adminAuthController.js";
import { usersManage, blockUser, unblockUser} from "../../controllers/admin/manageUser.js";
import { isAdminAuth, isAdminLogin } from "../../middleware/adminMiddleware.js";
import { getCategoryPage, addNewCategory, editNewCategory, deleteCategory, list, unlist, searchCategory, filterCategory } from "../../controllers/admin/category.js";
import { listProduct, getAddProductPage, getEditProductPage, addProduct, editProduct, deleteProduct, active, block } from "../../controllers/admin/product.js";
import { categoryUploads } from "../../config/categoryMulter.js";
import { productUploads } from "../../config/productMulter.js";
import { addNewOffer, loadOfferPage, deleteOffer } from "../../controllers/admin/offer.js";


router.get("/admin/login", isAdminLogin, (req, res) => res.render("admin/loginAdmin"))
router.post("/admin/login",isAdminLogin, adminLogin)
router.get("/admin/home", isAdminAuth,(req, res) => res.render("admin/adminhome"))
router.get("/admin/user", isAdminAuth, usersManage);
router.patch("/admin/user/block/:id",isAdminAuth, blockUser);
router.patch("/admin/user/unblock/:id", isAdminAuth, unblockUser);

router.get("/admin/category",isAdminAuth, getCategoryPage);
router.post("/admin/category/add", 
    categoryUploads.single("categoryImage"),
    addNewCategory
)
router.put("/admin/category/edit/:catId",
    categoryUploads.single("categoryImage"),
    editNewCategory
);
router.delete("/admin/category/delete/:id", isAdminAuth, deleteCategory);
router.patch("/admin/category/list/:id", isAdminAuth, list);
router.patch("/admin/category/unlist/:id", isAdminAuth, unlist);

router.get("/admin/categories/search", isAdminAuth, searchCategory);
router.get("/admin/categories/filter", isAdminAuth, filterCategory);

router.get("/admin/product", isAdminAuth, listProduct);
router.get("/admin/product/add-new", isAdminAuth, getAddProductPage);
router.get("/admin/product/edit/:id", isAdminAuth, getEditProductPage);
router.post("/admin/product/add",isAdminAuth,
    productUploads.fields([
        { name : "productImage1", maxCount : 1},
        { name : "productImage2", maxCount : 1},
        { name : "productImage3", maxCount : 1},
       
    ]),
    addProduct
 );

router.put("/admin/product/edit/:id", isAdminAuth,
    productUploads.fields([
        {name : "productImage1" , maxCount : 1},
        {name : "productImage2" , maxCount : 1},
        {name : "productImage3" , maxCount : 1},
        
    ]),
    editProduct);
router.delete("/admin/product/delete/:id", isAdminAuth, deleteProduct);
router.patch("/admin/product/list/:id", isAdminAuth, active)
router.patch("/admin/product/unlist/:id", isAdminAuth, block)

router.get("/admin/offer",isAdminAuth, loadOfferPage)
router.post("/admin/offer/add", isAdminAuth, addNewOffer)
router.delete("/admin/offer/delete/:id", isAdminAuth, deleteOffer)
// router.post("/admin/offer/search", isAdminAuth, searchOffers)
export default router   
