const cartModel = require("../models/cartModel");
const userModels = require("../models/userModels")
const productModel = require("../models/productModel")
const { isValid, isValidBody, isValidRequestBody, isValidSize, isValidTName, isValidImg, isValidName, isValidObjectId } = require("../utils/util");





const createCart = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};



const updateCart = async function (req, res) {
  try {
    let userId = req.params.userId
    let requestBody = req.body

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "Invalid userId in body" })
    }

    let user = await userModels.findOne({ _id: userId })
    if (!user) {
      return res.status(404).send({ status: false, message: "UserId does not exits" })
    }

    const { cartId, productId, removeProduct } = requestBody

    if (!isValidRequestBody(requestBody)) {
      return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide cart details.' })
    }

    //cart

    if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Cart id is required" })


    if (!isValidObjectId(cartId)) {
      return res.status(400).send({ status: false, message: "Invalid cartId in body" })
    }

    let cart = await cartModel.findById(cartId)


    if (!cart) {
      return res.status(404).send({ status: false, message: "cartId does not exits" })
    }

    //product
    if (!isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: "Invalid productId in body" })
    }

    let product = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!product) {
      return res.status(404).send({ status: false, message: "productId does not exits" })
    }

    //find if products exits in cart
    let isProductinCart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } })

    if (!isProductinCart) {
      return res.status(404).send({ status: false, message: `This ${productId} product does not exits in the cart` })
    }

    //removeProduct validation
    if (!(!isNaN(Number(removeProduct)))) {
      return res.status(400).send({ status: false, message: `removeProduct should be a valid number either 0 or 1` })
    }
    if (!((removeProduct === 0) || (removeProduct === 1))) {
      return res.status(400).send({ status: false, message: 'removeProduct should be 0 (product is to be removed) or 1(quantity has to be decremented by 1) ' })
    }


    let findQuantity = cart.items.find(x => x.productId.toString() === productId)

    if (removeProduct === 0) {

      let totalAmount = cart.totalPrice - (product.price * findQuantity.quantity) // substract the amount of product*quantity

      await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })   //pull the product from itmes  //https://stackoverflow.com/questions/15641492/mongodb-remove-object-from-array

      let quantity = cart.totalItems - 1
      let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true })   //update the cart with total items and totalprice

      return res.status(200).send({ status: true, message: `${productId} has been removed`, data: data })

    }
    if (removeProduct === 1) {


      // decrement quantity
      let totalAmount = cart.totalPrice - product.price
      let arr = cart.items
      for (i in arr) {
        if (arr[i].productId.toString() == productId) {
          arr[i].quantity = arr[i].quantity - 1
          if (arr[i].quantity < 1) {
            await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })
            let quantity = cart.totalItems - 1

            let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true })   //update the cart with total items and totalprice

            return res.status(400).send({ status: false, message: 'No such Quantity/Product present in this Cart', data: data })
          }
        }
      }

      let data = await cartModel.findOneAndUpdate({ _id: cartId }, { items: arr, totalPrice: totalAmount }, { new: true })

      return res.status(200).send({ status: true, message: `${productId} quantity is been reduced by 1`, data: data })
    }

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};




const getCart = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};




const deleteCart = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
