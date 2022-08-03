const cartModel = require("../models/cartModel");
const userModel = require("../models/userModels");
const productModel = require("../models/productModel");

const {
  isValid,
  isValidRequestBody,
  isValidObjectId,
} = require("../utils/util");

//<<============================= Create Cart =================================>>//

const createCart = async function (req, res) {
  try {
    const CartData = req.body;
    const userId = req.params.userId;
    let { cartId, productId, quantity } = CartData;
    // let data = {};

    if (!isValidRequestBody(CartData)) {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide Cart information" });
    }

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide valid User Id" });
    }
    //-------------------------------------
    const findUserId = await userModel.findOne({ _id: userId });

    if (!findUserId) {
      return res.status(400).send({ status: false, message: "User not found" });
    }

    if (!isValid(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide Product Id" });
    }

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please Provide valid Product Id " });
    }
    //--------------------------------------
    const checkProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!checkProduct) {
      return res
        .status(400)
        .send({ status: false, message: "No Such Product Exist" });
    }

    // data.productId = productId;
    if (!quantity) {
      quantity = 1;
    }

    if (quantity) {
      if (typeof quantity !== "number" || quantity <= 0) {
        return res
          .status(400)
          .send({ status: false, message: "Enter Valid Quantity" });
      }
    }

    if (!cartId) {
      let cart = await cartModel.findOne({ userId: userId });
      if (cart) {
        return res.status(400).send({
          status: false,
          message: `${cart.userId} with this userId cart is already present ${cart._id} this is your cart id `,
        });
      }
      if (!cart) {
        const addToCart = {
          userId: userId,
          items: {
            productId: productId,
            quantity: quantity,
          },
          totalPrice: checkProduct.price * quantity,
          totalItems: 1,
        };

        const newCart = await cartModel.create(addToCart);
        return res.status(201).send({
          status: true,
          message: "cart created and product added to cart successfully",
          data: newCart,
        });
      }
    }

    if (cartId) {
      if (!isValidObjectId(cartId)) {
        return res
          .status(400)
          .send({ status: false, message: "CartId is Not Valid" });
      }

      let checkCartId = await cartModel.findOne({ _id: cartId });

      if (!checkCartId) {
        return res.status(400).send({
          status: false,
          message: `cart not exist with this id ${cartId} so create cart first`,
        });
      }

      if (checkCartId.userId.toString() != findUserId._id.toString()) {
        return res
          .status(400)
          .send({ status: false, message: `userId not match to cart ` });
      }

      //for Same Product Id
      let arr = checkCartId.items;
      let priceSum = checkCartId.totalPrice + checkProduct.price * quantity;

      if (checkCartId) {
        for (let i in arr) {
          if (arr[i].productId.toString() == productId) {
            arr[i].quantity++;
            checkCartId.totalPrice = priceSum;
            checkCartId.totalItems = arr.length;

            checkCartId.save();
            return res.status(200).send({
              status: true,
              message: `Quantity of ${arr[i].productId} increases`,
              data: checkCartId,
            });
          }
        }
        checkCartId.items[checkCartId.items.length] = {
          productId: productId,
          quantity: quantity,
        };
        checkCartId.totalPrice = priceSum;
        checkCartId.totalItems = checkCartId.items.length;
        checkCartId.save();
        return res.status(200).send({
          status: true,
          message: `New product ${checkCartId._id} added in cart`,
          data: checkCartId,
        });
      }
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<============================= Update Cart =================================>>//

const updateCart = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<============================= Get Cart Details =================================>>//

const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;

    //----------------------------------------------Validation Starts---------------------------------------//
    // validating userid from params
    if (!isValid(userId)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. userId is required",
      });
    }
    if (!isValidObjectId(userId)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. userId is not valid",
      });
    }
    let user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).send({
        status: false,
        message: "No such user found. Please register and try again",
      });
    }
    let usercartid = await cartModel.findOne({ userId: userId });
    if (!usercartid) {
      return res.status(404).send({
        status: false,
        message: "No such cart found. Please register and try again",
      });
    }

    return res.status(200).send({ status: true, data: usercartid });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<============================= Delete Cart  =================================>>//

const deleteCart = async function (req, res) {
  try {
    let userId = req.params.userId;

    //--------------------------- ---------------------Validation Starts-------------------------------------//
    // validating userid from params
    if (!isValid(userId)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. userId is required",
      });
    }
    if (!isValidObjectId(userId)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. userId is not valid",
      });
    }

    let Userdata = await userModel.findOne({ _id: userId });
    if (!Userdata) {
      return res
        .status(404)
        .send({
          status: false,
          message: "No such user exists with this userID",
        });
    }

    let usercart = await cartModel.findOne({ userId: userId });
    if (!usercart) {
      return res.status(404).send({
        status: false,
        message: "No such user found. Please register and try again",
      });
    }
    usercart.userId = userId;
    usercart.items = [];
    usercart.totalPrice = 0;
    usercart.totalItems = 0;
    usercart.save();

    return res
      .status(200)
      .send({ status: true, message: "Cart successfully Deleted!" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
