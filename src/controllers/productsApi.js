const productModel = require("../models/productModel");

//<<============================ Create  Product  ==============================>>//

const createProducts = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<============================ Get Product By Query Filter ==============================>>//

const getProducts = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<============================Get Product By Id ==============================>>//

const getProductbyId = async function (req, res) {
  try {
    let Pid = req.params.productId;

    if (!isValid(Pid) && !isValidObjectId(Pid)) {
      return res.status(400).send({
        status: false,
        message: "Invalid Product ID please Provide Valid Credential",
      });
    }

    const findProductDb = await productModel.findOne({
      _id: Pid,
      isDeleted: false,
    });

    if (!findProductDb) {
      return res.status(404).send({ status: false, message: "Data Not Found" });
    }

    return res
      .status(200)
      .send({ status: true, message: "success", data: findProductDb });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<============================ Update Product By Id ==============================>>//

const updateProductbyId = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<============================ Delete Product By Id ==============================>>//

const deleteProductbyId = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createProducts,
  getProducts,
  getProductbyId,
  updateProductbyId,
  deleteProductbyId,
};
