const productModel = require("../models/productModel");
const {validString} = require("../utils/util");

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
    const inputs = req.query;

        let filterData = {}
        filterData.isDeleted = false


        if (!validString(inputs.size)) {
            return res.status(400).send({ status: false, msg: "Please Provide a Valid Size!" })
        }
        if (inputs.size) {
            let sizes = inputs.size.split(",").map(x => x.trim())
            filterData['availableSizes'] = sizes
        }

        if (!validString(inputs.name)) {
            return res.status(400).send({ status: false, msg: "Please Provide a Name Of the Product!" })
        }

        if (inputs.name) {
            filterData['title'] = {}
            filterData['title']['$regex'] = inputs.name //$regex to match the subString
            filterData['title']['$options'] = 'i'  //"i" for case insensitive.

        }

        if (!validString(inputs.priceGreaterThan)) {
            return res.status(400).send({ status: false, msg: "Please Provide a Lowest Price Of the Product!" })
        }
        if (!validString(inputs.priceLessThan)) {
            return res.status(400).send({ status: false, msg: "Please Provide a Highest Price Of the Product!" })
        }
        if (inputs.priceGreaterThan || inputs.priceLessThan) {

            filterData.price = {}

            if (inputs.priceGreaterThan) {

                if (isNaN(Number(inputs.priceGreaterThan))) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                }
                if (inputs.priceGreaterThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan shouldn't be 0 or-ve number` })
                }

                filterData['price']['$gte'] = Number(inputs.priceGreaterThan)

            }


            if (inputs.priceLessThan) {

                if (isNaN(Number(inputs.priceLessThan))) {
                    return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                }
                if (inputs.priceLessThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceLessThan can't be 0 or -ve` })
                }

                filterData['price']['$lte'] = Number(inputs.priceLessThan)

            }
        }

        if (!validString(inputs.priceSort)) {
            return res.status(400).send({ status: false, msg: "Please Sort 1 for Ascending -1 for Descending order!" })
        }

        if (inputs.priceSort) {

            if (!((inputs.priceSort == 1) || (inputs.priceSort == -1))) {
                return res.status(400).send({ status: false, message: `priceSort should be 1 or -1 ` })
            }

            const products = await productModel.find(filterData).sort({ price: inputs.priceSort })

            if (!products.length) {
                return res.status(404).send({ productStatus: false, message: 'No Product found' })
            }

            return res.status(200).send({ status: true, message: 'Product list', data2: products })
        }


        const products = await productModel.find(filterData)

        if (!products.length) {
            return res.status(404).send({ productStatus: false, message: 'No Product found' })
        }

        return res.status(200).send({ status: true, message: 'Product list', data: products })
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

    return res.status(200).send({
      status: true,
      message: "Success",
      data: findProductDb,
    });
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
    let Pid = req.params.productId;

    if (!isValid(Pid) && !isValidObjectId(Pid)) {
      return res.status(400).send({
        status: false,
        message: "Invalid Product ID please Provide Valid Credential",
      });
    }

    const findProductDb = await productModel.findOneAndDelete(
      {
        _id: Pid,
        isDeleted: false,
      },
      { isDeleted: true, deletedAt: new Data() },
      { new: true }
    );

    if (!findProductDb) {
      return res
        .status(404)
        .send({ status: false, message: "Data Not Found Or Already Deleted" });
    }

    return res.status(200).send({
      status: true,
      message: "Deleted Successfully",  
      data: findProductDb,
    });
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
