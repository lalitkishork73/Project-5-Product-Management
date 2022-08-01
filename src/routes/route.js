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

const { Authentication, Authorization } = require("../middlewares/auth");

//------------------- API and Method Routes-------------------//

//------------------- User APIs ------------------------------//

router.post("/register", userRegister);
router.post("/login", loginUser);
router.get("/user/:userId/profile", Authentication, getProfile);
router.put("/user/:userId/profile", Authentication, Authorization, UpdateProfile);

//-------------------------- Product APIs ----------------------//

router.post("/products", createProducts);
router.get("/products", getProducts);
router.get("/products/:productId", getProductbyId);
router.put("/products/:productId", updateProductbyId);
router.delete("/products/:productId", deleteProductbyId);

//------------------- Exporting Modules -------------------//

module.exports = router;
