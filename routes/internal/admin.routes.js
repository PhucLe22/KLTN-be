import express from "express";
import { storeController } from "../../controllers/store.controller.js";
import { validateData } from "../../middlewares/validate.middleware.js";
import { createStoresSchema as inputCreateStoresSchema, updateStoresSchema as inputUpdateStoresSchema, deleteStoresSchema as inputDeleteStoresSchema } from "../../contracts/input/store.schema.js";
import { getUsersSchema as inputGetUsersSchema, updateUserSchema as inputUpdateUserSchema, deleteUserSchema as inputDeleteUserSchema } from "../../contracts/input/user.schema.js";
import { getProductsSchema, createProductSchema, updateProductSchema, deleteProductSchema } from "../../contracts/input/product.schema.js";
import { getCategoriesSchema, createCategorySchema, updateCategorySchema, deleteCategorySchema } from "../../contracts/input/category.schema.js";
import { protect } from "../../middlewares/authentication.middleware.js";
import { restrictTo } from "../../middlewares/authorize.middleware.js";
import { userController } from "../../controllers/user.controller.js";
import { productController } from "../../controllers/product.controller.js";
import { categoryController } from "../../controllers/category.controller.js";

const adminRouter = express.Router();

const storeRoutes = express.Router();

const userRoutes = express.Router();

const productRoutes = express.Router();

const categoryRoutes = express.Router();

adminRouter.use("/stores", storeRoutes);
adminRouter.use("/users", userRoutes);
adminRouter.use("/products", productRoutes);
adminRouter.use("/categories", categoryRoutes); 
/**
 * @route   GET /api/v1/stores
 * @desc    Lấy danh sách cửa hàng
 * @access  Private (Staff authentication required)
 */
storeRoutes.get("/", protect, restrictTo("ADMIN"), storeController.getAllStores);
 
/**
 * @route   POST /api/v1/stores
 * @desc    Tạo cửa hàng
 * @access  Private (Staff authentication required)
 */
storeRoutes.post("/", validateData({ body: inputCreateStoresSchema.body }), protect, restrictTo("ADMIN"), storeController.createStore);
 
/**
 * @route   PUT /api/v1/stores/:id
 * @desc    Cập nhật cửa hàng
 * @access  Private (Staff authentication required)
 */
storeRoutes.put("/:id", validateData({ params: inputUpdateStoresSchema.params, body: inputUpdateStoresSchema.body }), protect, restrictTo("ADMIN"), storeController.updateStore);
 
/**
 * @route   DELETE /api/v1/stores/:id
 * @desc    Xóa cửa hàng
 * @access  Private (Staff authentication required)
 */
storeRoutes.delete("/:id", validateData({ params: inputDeleteStoresSchema.params }), protect, restrictTo("ADMIN"), storeController.deleteStore);

adminRouter.use("/users", userRoutes);
/** 
 * @route   GET /api/v1/users
 * @desc    Lấy danh sách người dùng
 * @access  Private (Staff authentication required)
*/
userRoutes.get("/", validateData({ query: inputGetUsersSchema.query }), protect, restrictTo("ADMIN"), userController.getAllUsers);

/** 
 * @route   PUT /api/v1/users/:id
 * @desc    Cập nhật người dùng
 * @access  Private (Staff authentication required)
*/
userRoutes.put("/:id", validateData({ params: inputUpdateUserSchema.params, body: inputUpdateUserSchema.body }), protect, restrictTo("ADMIN"), userController.updateUser);

/** 
 * @route   DELETE /api/v1/users/:id
 * @desc    Xóa người dùng
 * @access  Private (Staff authentication required)
*/
userRoutes.delete("/:id", validateData({ params: inputDeleteUserSchema.params }), protect, restrictTo("ADMIN"), userController.deleteUser);


/**
 * @route   GET /api/v1/products
 * @desc    Lấy danh sách sản phẩm
 * @access  Private (Admin authentication required)
 */
productRoutes.get("/", validateData({ query: getProductsSchema.query }), protect, restrictTo("ADMIN"), productController.getAllProducts);

/**
 * @route   POST /api/v1/products
 * @desc    Tạo sản phẩm mới
 * @access  Private (Admin authentication required)
 */
productRoutes.post("/", validateData({ body: createProductSchema.body }), protect, restrictTo("ADMIN"), productController.createProduct);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Cập nhật sản phẩm
 * @access  Private (Admin authentication required)
 */
productRoutes.put("/:id", validateData({ params: updateProductSchema.params, body: updateProductSchema.body }), protect, restrictTo("ADMIN"), productController.updateProduct);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Xóa sản phẩm
 * @access  Private (Admin authentication required)
 */
productRoutes.delete("/:id", validateData({ params: deleteProductSchema.params }), protect, restrictTo("ADMIN"), productController.deleteProduct);

/**
 * @route   GET /api/v1/categories
 * @desc    Lấy danh sách danh mục
 * @access  Private (Admin authentication required)
 */
categoryRoutes.get("/", validateData({ query: getCategoriesSchema.query }), protect, restrictTo("ADMIN"), categoryController.getAllCategories);

/**
 * @route   GET /api/v1/categories/:slug
 * @desc    Lấy danh mục theo slug
 * @access  Private (Admin authentication required)
 */
categoryRoutes.get("/:slug", validateData({ params: getCategoriesSchema.params }), protect, restrictTo("ADMIN"), categoryController.getCategoryBySlug);

/**
 * @route   POST /api/v1/categories
 * @desc    Tạo danh mục mới
 * @access  Private (Admin authentication required)
 */
categoryRoutes.post("/", validateData({ body: createCategorySchema.body }), protect, restrictTo("ADMIN"), categoryController.createCategory);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Cập nhật danh mục
 * @access  Private (Admin authentication required)
 */
categoryRoutes.put("/:id", validateData({ params: updateCategorySchema.params, body: updateCategorySchema.body }), protect, restrictTo("ADMIN"), categoryController.updateCategory);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Xóa danh mục
 * @access  Private (Admin authentication required)
 */
categoryRoutes.delete("/:id", validateData({ params: deleteCategorySchema.params }), protect, restrictTo("ADMIN"), categoryController.deleteCategory);

export default adminRouter;