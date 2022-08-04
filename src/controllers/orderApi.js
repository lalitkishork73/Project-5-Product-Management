const orderModel = require("../models/orderModel");
const { isValidObjectId, isValidRequestBody } = require("../utils/util");

const createOrder = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateOrder = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createOrder, updateOrder };
