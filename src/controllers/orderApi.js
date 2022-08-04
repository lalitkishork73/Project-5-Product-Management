
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const {isValid, isValidObjectId, isValidRequestBody } = require("../utils/util");

const createOrder = async function (req, res) {
  try { 
    let userId=req.params.userId
     let requestBody=(req.body)

    if(!isValidRequestBody(requestBody)) {
      return res.status(400).send({status:false,message:"Invalid request parameters. Please provide cart details."})
    }
    if(!isValid(userId)){
      return res.status(400).send({status:false, message: 'please enter user ID'})
    }
    if(!isValidObjectId(userId)){
      return res.status(400).send({status:false, message: 'Invalid user ID'})
    }
    let usercartid=await userModel.findOne({_id:userId});
    if(!usercartid){
      return res.status(404).send({status:false, message: "User ID not found"});
    }
    let existCart= await cartModel.findOne({userId:userId});
    if(!existCart){
      return res.status(404).send({status:false, message: "User ID not found"});
    }
    const {items,totalItems,totalPrice}=existCart

    if(totalItems==0){
      return res.status(202).send({status:false, message: "Order Alredy placed from this cart Or cart is empty" });
    }
    let totalQuantity=items.map(x=>x.quantity).reduce(function(sum,item){return sum + item.quantity;});

    let obj={userId:userId, totalQuantity:totalQuantity,items:items,totalItems:totalItems,totalPrice:totalPrice}

    if(requestBody.cancellable){
      if(!((requestBody.cancellable=="true") || (requestBody.cancellable=="false"))){ 
      return res.status(400).send({ status: false, message: "cancellable should have only true/false in it"})
    }
    obj['cancellable'] = requestBody.cancellable
    }
    let orders= await orderModel.create(obj)

    await cartModel.findOneAndUpdate({ userId:userId},{ items: [], totalPrice: 0, totalItems: 0 })
    res.status(200).send({ status: true, msg: 'order created successfully', data: orders })
        
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

module.exports = { createOrder, updateOrder };
