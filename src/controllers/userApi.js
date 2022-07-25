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
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getProfile = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const UpdateProfile = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { userRegister, loginUser, getProfile, UpdateProfile };
