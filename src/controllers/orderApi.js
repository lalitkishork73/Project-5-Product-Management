const orderModel = require("../models/orderModel");

const createOrder = async function (req, res) {
  try { 
    const userId=req.params.userId
    const requestBody=req.body

    if()
    // const requestBody= JSON.parse(req.body)
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
