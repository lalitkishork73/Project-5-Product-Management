//------------------- Importing Modules -------------------//

const express = require("express");
const router = express.Router();
const { userRegister, loginUser } = require("../controllers/userApi");

//------------------- API and Method Routes-------------------//

router.post("/register", userRegister);
router.post("/login", loginUser);

//------------------- Exporting Modules -------------------//

module.exports = router;
