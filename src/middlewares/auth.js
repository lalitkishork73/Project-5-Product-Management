const userModel = require("../models/userModels");
const jwt = require("jsonwebtoken");
const {} = require("../utils/util");

const Authentication = async function (req, res, next) {
  try {
    const token = req.header["x-api-key"] || req.header["x-Api-key"];

    if (!token) {
      return res.status(404).json({ error: "Invalid Token" });
    }
    const decodedToken = jwt.verify(token, "project-5-group27");
    let LoginUserId = decodedToken.userId;
    if (!decodedToken) {
      return res
        .status(401)
        .send({ status: false, message: "Warning unauthorized" });
    }

    req["userId"] = LoginUserId;
    next();
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
        .send({ status: false, message: `Book id ${UserId} is invalid` });
    }
    const findUserId = await userModel.findOne({ _id: UserId });
    if (!findUserId)
      return res.status(404).send({ status: false, message: "User not found" });

    const { userId } = findUserId;

    if (tokenId.toString() !== userId.toString()) {
      return res.status(403).send({ status: false, message: "User not Found" });
    }
    next();
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { Authentication, Authorization };
