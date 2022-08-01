const cartModel = require("../models/cartModel");

const createCart = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
const updateCart = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;
   
    //----------------------------------------------Validation Starts---------------------------------------//
    // validating userid from params
    if (!isValid(userId)) {
        return res.status(400).send({ status: false, message: "Invalid request parameters. userId is required" });
    }
    if (!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "Invalid request parameters. userId is not valid" });
    }
    let user = await userModel.findOne({ _id: userId })
    if (!user) {
        return res.status(404).send({ status: false, msg: "No such user found. Please register and try again" });
    }
    let usercartid = await cartModel.findOne({ userId: userId });
    if (!usercartid) {
        return res.status(404).send({ status: false, msg: "No such cart found. Please register and try again" });
    }
   
    return res.status(200).send({ status: true, data: usercartid })
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
const deleteCart = async function (req, res) {
  try {
    let userId = req.params.userId;
        
        //--------------------------- ---------------------Validation Starts-------------------------------------//
        // validating userid from params
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. userId is required" });
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. userId is not valid" });
        }

        let Userdata = await userModel.findOne({ _id: userId })
        if (!Userdata) {
            return res.status(404).send({ status: false, msg: "No such user exists with this userID" });
        }
      
        let usercart = await cartModel.findOne({ userId: userId })
        if (!usercart) {
            return res.status(404).send({ status: false, msg: "No such user found. Please register and try again" });
        }
        let updatedUserCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
        return res.status(200).send({ status: true })
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
