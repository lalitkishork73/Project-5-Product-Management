const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("../utils/util");

const Authentication = async function (req, res, next) {
  try {
    // const token = req.headers["x-api-key"] || req.headers["x-Api-key"];
    // console.log(token);
    let tokenWithBearer = req.headers["authorization"];

    if (!tokenWithBearer) {
      return res
        .status(400)
        .send({ status: false, message: "token is required" });
    }
    let tokenArray = tokenWithBearer.split(" ");
    let token = tokenArray[1];

    if (!token) {
      return res.status(404).send({ status: false, message: "Invalid Token" });
    }
    let decodedToken;
     jwt.verify(token, "project-5-group27",(err,decode)=>{
      if(err){
        return res
          .status(401)
          .send({ status: false, message: err.message });
      }
      else{
        decodedToken=decode;
        let LoginUserId = decodedToken.userId;
        req["userId"] = LoginUserId;
        next();
      }
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const Authorization = async function (req, res, next) {
  try {
    let tokenId = req.userId;
    let UserId = req.params.userId || req.query.userId;

    if (!isValidObjectId(UserId)) {
      return res
        .status(400)
        .send({ status: false, message: `UserId ${UserId} is invalid` });
    }
    const findUserId = await userModel.findOne({ _id: UserId });
    if (!findUserId)
      return res.status(404).send({ status: false, message: "User not found" });
    const userId = findUserId._id;

    if (tokenId.toString() !== userId.toString()) {
      return res
        .status(403)
        .send({
          status: false,
          message: `This Userid: ${userId} is Unautherized`,
        });
    }
    next();
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { Authentication, Authorization };
