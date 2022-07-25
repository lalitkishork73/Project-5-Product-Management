//------------------- Importing Modules -------------------//

const express = require("express");
const router = express.Router();
const {
  userRegister,
  loginUser,
  getProfile,
  UpdateProfile,
} = require("../controllers/userApi");

const { Authentication, Authorization } = require("../middlewares/auth");

//------------------- API and Method Routes-------------------//

//------------------- User APIs ------------------------------//
router.post("/register", userRegister);
router.post("/login", loginUser);
router.get(" /user/:userId/profile", Authentication, getProfile);
router.put(
  "/user/:userId/profile",
  Authentication,
  Authorization,
  UpdateProfile
);

//------------------- Exporting Modules -------------------//

module.exports = router;
