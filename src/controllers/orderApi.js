const cartModel = require("../models/cartModel");
const orderModel = require('../Models/orderModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModels')
const {
  isValid,
  isValidObjectId,
  isValidRequestBody,
  validString,
  isValidImg,
  isValidSize,
  isValidTName,
  isValidStatus
} = require("../utils/util");


const createOrder = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateOrder = async function (req, res) {
  try {
    let requestBody = req.body;
    let userId = req.params.userId;
    const { status, orderId } = requestBody;

    let userExist = await userModel.findOne({ _id:userId });
    if(!userExist){
      return res.status(404).send({ status: false, message: "User Not Found" })
    }

    if(!isValidRequestBody(requestBody)){ 
      return res.status(400).send({ status: false, message: "Please provide required value in body" })
     }

    if(!isValid(orderId)){
      return res.status(400).send({ status: false, message: "Please provide orderId in request body" })
    }

    if(!isValidObjectId(orderId)){
      return res.status(400).send({ status: false, message: "Please provide VALID orderId in request body" })
    }

    let orderPresent = await orderModel.findOne({ _id: orderId, isDeleted: false });

    if(!orderPresent) {
      return res.status(404).send({ status: false, message: "Order Not Found" })
    }

    let orderUser = orderPresent.userId.toString()

    if(orderUser != userId){
      return res.status(400).send({ status: false, message: "This orderId does NOT belong to the User" })
    }

    if(!isValidStatus(status)) {
      return res.status(400).send({ status: false, message: "Status should be - 'pending', 'complete' or 'cancled'" })
    }

    if(status == "pending" || status == "completed") {
      return res.status(400).send({ status: false, message: "status cannot be pending and completed" })
    }

    let orderStatus = await orderModel.findOneAndUpdate({ _id: orderId}, { $set: requestBody }, { new: true })
    let cartUpdate = await cartModel.findOneAndUpdate({ userId: userId }, {$set: { items: [], totalPrice: 0, totalItems: 0 }}, { new: true })
    res.status(200).send({ status: true, data: orderStatus })

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


module.exports = { createOrder, updateOrder }