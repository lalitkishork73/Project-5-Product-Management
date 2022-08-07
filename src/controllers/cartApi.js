const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
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

    if (!(productId || isValid(productId))) {
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
          message: "Success",
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
            return res.status(201).send({
              status: true,
              message: `Success`,
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
        return res.status(201).send({
          status: true,
          message: `Success`,
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
    let userId = req.params.userId;
    let requestBody = req.body;

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid userId in body" });
    }

    let user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res
        .status(404)
        .send({ status: false, message: "UserId does not found" });
    }

    const { cartId, productId, removeProduct } = requestBody;

    if (!isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide cart details.",
      });
    }

    //cart

    if (!isValid(cartId))
      return res
        .status(400)
        .send({ status: false, message: "Cart id is required" });

    if (!isValidObjectId(cartId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid cartId in body" });
    }

    let cart = await cartModel.findById(cartId);

    if (!cart) {
      return res
        .status(404)
        .send({ status: false, message: "cartId does not found" });
    }

    //product
    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid productId in body" });
    }
    let product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!product) {
      return res
        .status(404)
        .send({ status: false, message: "productId does not found" });
    }
    // cart;
    //find if products exits in cart
    let isProductinCart = await cartModel.findOne({
      items: { $elemMatch: { productId: productId } },
    });

    if (!isProductinCart) {
      return res.status(404).send({
        status: false,
        message: `This ${productId} product does not found in the cart`,
      });
    }
    if (typeof removeProduct === "undefined") {
      return res.status(400).send({
        status: false,
        message: "please provide 0 or 1",
      });
    }

    //removeProduct validation
    if (!!isNaN(Number(removeProduct))) {
      return res.status(400).send({
        status: false,
        message: `removeProduct should be a valid number either 0 or 1`,
      });
    }
    if (!(removeProduct === 0 || removeProduct === 1)) {
      return res.status(400).send({
        status: false,
        message:
          "removeProduct should be 0 (product is to be removed) or 1(quantity has to be decremented by 1) ",
      });
    }
    let { price } = product;
    let { items, totalPrice, totalItems } = cart;
    let findQuantity = items.find((x) => x.productId.toString() === productId);

    for (i in items) {
      if (items[i].productId.toString() == productId) {
        if (removeProduct === 0) {
          let totalAmount = totalPrice - price * findQuantity.quantity;
          totalItems--;


          const wipeCart = await cartModel.findOneAndUpdate(
            { _id: cartId },
            {
              $pull: { items: { productId: productId } },
              totalPrice: totalAmount,
              totalItems: totalItems,
            },
            { new: true }
          );
          //pull the product from itmes

          return res.status(200).send({
            status: true,
            message: `Success`,
            data: wipeCart,
          });
        }

        if (removeProduct === 1) {
          let totalAmount = totalPrice - price;
          items[i].quantity--;
          totalItems--;
          console.log(items[i].quantity)

          if (items[i].quantity < 1) {
            const wipeCart = await cartModel.findOneAndUpdate(
              { _id: cartId },
              {
                $pull: { items: { productId: productId } },
                totalPrice: totalAmount,
                totalItems: totalItems,
              },
              { new: true }
            );

            return res.status(200).send({
              status: true,
              message: "Success",
              data: wipeCart,
            });
          }

          let data = await cartModel.findOneAndUpdate(
            { _id: cartId },
            { items: items, totalPrice: totalAmount },
            { new: true }
          );

          return res.status(200).send({
            status: true,
            message: `Success`,
            data: data,
          });
        }
      }
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<============================= Get Cart Details =================================>>//

const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;

    //--------------------------Validation Starts---------------------------//
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
    // let product = await productModel.findOne({ _id: productId }).select({title:title});
    // if (!product) {
    //   return res.status(404).send({
    //     status: false,
    //     message: "No such user found. Please register and try again",
    //   });
    // }
    let usercartid = await cartModel.findOne({ userId: userId });
    if (!usercartid) {
      return res.status(404).send({
        status: false,
        message: "No such cart found. Please register and try again",
      });
    }

    return res.status(200).send({ status: true,message:"Success", data: usercartid });
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
      return res.status(404).send({
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

    return res.status(204).send({
      status: true,
      message: "Cart successfully Deleted!",
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
