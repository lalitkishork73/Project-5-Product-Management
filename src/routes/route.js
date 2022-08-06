//------------------- Importing Modules -------------------//

const express = require("express");
const router = express.Router();
const {
  userRegister,
  loginUser,
  getProfile,
  UpdateProfile,
} = require("../controllers/userApi");

const {
  createProducts,
  getProducts,
  getProductbyId,
  updateProductbyId,
  deleteProductbyId,
} = require("../controllers/productsApi");

const {
  createCart,
  updateCart,
  getCart,
  deleteCart,
} = require("../controllers/cartApi");

const { createOrder, updateOrder } = require("../controllers/orderApi");

const { Authentication, Authorization } = require("../middlewares/auth");

//------------------- API and Method Routes-------------------//

//------------------- User APIs ------------------------------//

router.post("/register", userRegister);
router.post("/login", loginUser);
router.get("/user/:userId/profile", Authentication, getProfile);
router.put(
  "/user/:userId/profile",
  Authentication,
  Authorization,
  UpdateProfile
);

//-------------------------- Product APIs ----------------------//

router.post("/products", createProducts);
router.get("/products", getProducts);
router.get("/products/:productId", getProductbyId);
router.put("/products/:productId", updateProductbyId);
router.delete("/products/:productId", deleteProductbyId);

//-------------------------- Cart APIs ----------------------//

router.post("/users/:userId/cart", Authentication, Authorization, createCart);
router.put("/users/:userId/cart", Authentication, Authorization, updateCart);
router.get("/users/:userId/cart", Authentication, Authorization, getCart);
router.delete("/users/:userId/cart", Authentication, Authorization, deleteCart);

//-------------------Order APIs --------------------------------//
router.post("/users/:userId/orders", Authentication, Authorization, createOrder)
router.put("/users/:userId/orders", Authentication, Authorization, updateOrder);


//------------------- Exporting Modules -------------------//

module.exports = router;
