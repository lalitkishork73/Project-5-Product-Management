const jwt = require("jsonwebtoken");
const userModel = require("../models/userModels");
const utils = require("../utils/util");

//<<================================= User Resgister ============================>>//

const userRegister = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<================================= User Login ============================>>//

const loginUser = async function (req, res) {
  try {

    let body = req.body;
    const { email, password } = body;

    if (isValidRequestBody(body)) return res.status(400).send({ status: false, message: "Body Should not be empty" });

    if (!("email" in body)) return res.status(400).send({ status: false, message: "Please enter email" });

    if (!("password" in body)) return res.status(400).send({ status: false, message: "Please enter password" });

    if (!isValid(email)) return res.status(400).send({ status: false, message: "email should not be empty" });

    if (!isValid(password)) return res.status(400).send({ status: false, message: "Password should not be empty" });

    let user = await userModel.findOne({ email: email, password: password });

    if (!user) return res.status(401).send({ status: false, message: "Please use valid credentials" });

    let token = jwt.sign(
      { userId: user._id.toString(), iat: Math.floor(new Date().getTime() / 1000) },

      "project-5-group27", { expiresIn: "300s" }
    );
    let decode = jwt.verify(token, "project-5-group27");
    let date = decode.iat;
    let time = new Date(date * 1000).toString();
    res.status(200).send({ status: true, message: "Successfully loggedin", userId: user._id, token: token });

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { userRegister, loginUser };
