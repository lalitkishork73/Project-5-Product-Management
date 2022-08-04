const productModel = require("../models/productModel");
const {
  isValid,
  isValidObjectId,
  isValidRequestBody,
  validString,
  isValidImg,
  isValidSize,
  isValidTName,
} = require("../utils/util");
const { uploadFile } = require("./awsConnect");

//<<============================ Create  Product  ==============================>>//

const createProducts = async function (req, res) {
  try {
    let data = req.body;
    let file = req.files;
    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      style,
      installments,
      availableSizes,
    } = data;

    if (!isValidRequestBody(data)) {
      return res.status(400).send({
        status: false,
        msg: "Provide the data for creating product ",
      });
    }

    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, msg: "Provide the title Name " });
    }
    // if (!(/^[a-zA-Z ]{2,30}$/.test(title))) {
    //     return res.status(400).send({ status: false, msg: "Enter valid  title" })
    // }
    let checkTitle = await productModel.findOne({ title: title });
    if (checkTitle) {
      return res.status(400).send({
        status: false,
        msg: "Product with this title is already present",
      });
    }

    if (!isValid(description)) {
      return res.status(400).send({
        status: false,
        msg: "please write description about product ",
      });
    }

    if (!isValid(price)) {
      return res
        .status(400)
        .send({ status: false, message: "price is required" });
    }
    if (!/^[0-9]*$/.test(price)) {
      return res
        .status(400)
        .send({ status: false, message: "price is required" });
    }

    if (!isValid(currencyId)) {
      return res
        .status(400)
        .send({ status: false, msg: "Provide the currencyId " });
    }
    if (currencyId != "INR") {
      return res
        .status(400)
        .send({ status: false, msg: "CurrencyId should be in INR" });
    }
    if (!currencyFormat) {
      return res
        .status(400)
        .send({ status: false, msg: "please enter currency symbol" });
    }
    if (currencyFormat != "₹") {
      return res
        .status(400)
        .send({ status: false, msg: "currencySymbol should be in ₹" });
    }


    if ('style') {
      if (!isValid(style)) {
        return res.status(400).send({ status: false, message: "style should be valid" });
      }
    }

    if ('installments') {
      if (installments <= 0 || installments % 1 != 0) {
        return res.status(400).send({ status: false, message: "installments can not be a decimal number " })
      }
    }

    if (file && file.length > 0) {
      let url = await uploadFile(file[0]);
      data["productImage"] = url;
    } else {
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide ProductImage" });
    }

    let sizes = availableSizes.toUpperCase().trim().split(",").map(e => e.trim())
        // for (let i = 0; i < sizes.length; i++) {
        //     if (!isValidSize(sizes[i])) { return res.status(400).send({ status: false, message: `The size accepted only from these (${sizes[i]}) S, XS, M, X, L, XXL, XL" ` }) }
        // }
        data.availableSizes = sizes

    const createdProduct = await productModel.create(data);
    return res.status(201).send({
      status: true,
      msg: "Product is Created Successfully",
      data: createdProduct,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<============================ Get Product By Query Filter ==============================>>//
// multiple queries not filtering properly
const getProducts = async function (req, res) {
  try {
    const queryData = req.query;

    let filterData = {};
    filterData.isDeleted = false;

    if (!validString(queryData.size)) {
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide a Valid Size!" });
    }
    if (queryData.size) {
      let sizes = queryData.size.split(",").map((x) => x.trim());
      filterData.availableSizes = sizes;
    }

    if (!validString(queryData.name)) {
      return res
        .status(400)
        .send({ status: false, msg: "Please Provide a Name Of the Product!" });
    }

    if (queryData.name) {
      filterData["title"] = {};
      filterData["title"]["$regex"] = queryData.name; //$regex to match the subString
      filterData["title"]["$options"] = "i"; //"i" for case insensitive.
    }
    // price > 300
    if (!validString(queryData.priceGreaterThan)) {
      return res.status(400).send({
        status: false,
        msg: "Please Provide a Lowest Price Of the Product!",
      });
    }
    if (!validString(queryData.priceLessThan)) {
      return res.status(400).send({
        status: false,
        msg: "Please Provide a Highest Price Of the Product!",
      });
    }
    if (queryData.priceGreaterThan || queryData.priceLessThan) {
      filterData.price = {};

      if (queryData.priceGreaterThan) {
        if (isNaN(Number(queryData.priceGreaterThan))) {
          return res.status(400).send({
            status: false,
            message: `priceGreaterThan should be a valid number`,
          });
        }
        if (queryData.priceGreaterThan <= 0) {
          return res.status(400).send({
            status: false,
            message: `priceGreaterThan shouldn't be 0 or-ve number`,
          });
        }

        filterData["price"]["$gte"] = Number(queryData.priceGreaterThan);   //{price: {$gte: {400}}}
      }

      if (queryData.priceLessThan) {
        if (isNaN(Number(queryData.priceLessThan))) {
          return res.status(400).send({
            status: false,
            message: `priceLessThan should be a valid number`,
          });
        }
        if (queryData.priceLessThan <= 0) {
          return res.status(400).send({
            status: false,
            message: `priceLessThan can't be 0 or -ve`,
          });
        }

        filterData["price"]["$lte"] = Number(queryData.priceLessThan); //{price: {$lte: {400}}}
      }
    }

    if (!validString(queryData.priceSort)) {
      return res.status(400).send({
        status: false,
        msg: "Please Sort 1 for Ascending -1 for Descending order!",
      });
    }

    if (queryData.priceSort) {
      if (!(queryData.priceSort == 1 || queryData.priceSort == -1)) {
        return res
          .status(400)
          .send({ status: false, message: `priceSort should be 1 (for ascending order) or -1 (for descending order) ` });
      }

      //console.log(filterData);
      const products = await productModel
        .find(filterData)
        .sort({ price: queryData.priceSort });

      if (!products.length) {
        return res
          .status(404)
          .send({ productStatus: false, message: "No Product found" });
      }

      return res
        .status(200)
        .send({ status: true, message: "Product list", data2: products });
    }

    const products = await productModel.find(filterData);

    if (!products.length) {
      return res
        .status(404)
        .send({ productStatus: false, message: "No Product found" });
    }

    return res
      .status(200)
      .send({
        status: true,
        message: "Product list",
        data: products,
        p: products.length, // for testing
      });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<============================Get Product By Id ==============================>>//

const getProductbyId = async function (req, res) {
  try {
    let Pid = req.params.productId;

    if (!isValidObjectId(Pid)) {
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
    let productId = req.params.productId
    if (productId.length == 0 || productId == ':productId') return res.status(400).send({ status: false, message: "Please enter productId in params" })
    if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Enter Id in valid Format" })

    let data = await productModel.findById(productId)
    if (!data) return res.status(404).send({ status: false, message: "No Data found with this ID" })
    if (data.isDeleted == true) { return res.status(400).send({ status: false, message: "This product is Deleted" }) }

    let body = req.body
    let files = req.files
    if (!files) {
      if (isValidRequestBody(body)) return res.status(400).send({ status: false, message: "Pls enter Some Data To update" })
    }
    let { title, description, price, productImage, style, availableSizes, installments, isFreeShipping } = body

    if ("title" in body) {
      if (!isValid(title)) return res.status(400).send({ status: false, message: "Title should not be empty" })
      if (!isValidTName(title)) return res.status(400).send({ status: false, message: "Enter Valid Title Name" })
      if (await productModel.findOne({ title: title })) return res.status(400).send({ status: false, message: `${title} is already exists` })
      let title1 = title.split(" ").filter(e => e).join(" ")
      data.title = title1
    }
    if ("description" in body) {
      if (!isValid(description)) return res.status(400).send({ status: false, message: "Description should not be empty" })
      data.description = description.split(" ").filter(e => e).join(" ")
    }
    if ("price" in body) {
      if (!isValid(price)) return res.status(400).send({ status: false, message: "Price should not be empty" })
      if (isNaN(parseInt(price))) return res.status(400).send({ status: false, message: "Price Should Be A Number" })
      data.price = price
    }

    if ("isFreeShipping" in body) {
      if (!isValid(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping should not be empty" })
      if (!(isFreeShipping.toLowerCase() === "true" || isFreeShipping.toLowerCase() === "false")) return res.status(400).send({ status: false, message: "isFreeShipping should be only True False" })
      data.isFreeShipping = isFreeShipping.toLowerCase()
    }
    if (typeof productImage === "string" || typeof productImage === "object") return res.status(400).send({ status: false, message: "ProductImg should be of typeFiles" })
    if (files && files.length > 0) {
      if (!(isValidImg(files[0].mimetype))) {
        return res.status(400).send({ status: false, message: "Image Should be of JPEG/ JPG/ PNG" })
      }
      let uploadedFileURL = await uploadFile(files[0])
      data.productImage = uploadedFileURL
    }
    if ("style" in body) {
      if (!isValid(style)) return res.status(400).send({ status: false, message: "Style should not be empty" })
      if (!isValidTName(style)) return res.status(400).send({ status: false, message: "Pls Enter Valid Style Category" })
      data.style = style
    }
    if ("availableSizes" in body) {
      if (!isValid(availableSizes)) return res.status(400).send({ status: false, message: "AvailableSizes should not be empty" })
      let sizes = availableSizes.toUpperCase().trim().split(",").map(e => e.trim())
      for (let i = 0; i < sizes.length; i++) {
        if (!isValidSize(sizes[i])) return res.status(400).send({ status: false, message: `This Size ( ${sizes[i]} ) is not from these ['S', 'XS','M','X', 'L','XXL','XL']` })
      }
      let savedSize = await productModel.findById(productId).select({ availableSizes: 1, _id: 0 })
      let value = savedSize["availableSizes"].valueOf()
      //for (let i = 0; i < sizes.length; i++) {
        // if (value.includes(sizes[i])) {
        //   return res.status(400).send({ status: false, message: `Size ${sizes[i]} is already Exists Choose Another One` })
        // }
        // else {
          let savedata = await productModel.findOneAndUpdate({ _id: productId }, { availableSizes: sizes }, { new: true })
          data.availableSizes = savedata.availableSizes
        //}
      //}
    }

    if ("installments" in body) {
      if (!isValid(installments)) return res.status(400).send({ status: false, message: "installments should not be empty" })
      if (isNaN(parseInt(installments))) return res.status(400).send({ status: false, message: "Installments Should be Of Number Type" })
      data.installments = installments
    }

    data.save()
    res.status(200).send({ status: false, message: "Updated Successfully", data: data })
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<============================ Delete Product By Id ==============================>>//

const deleteProductbyId = async function (req, res) {
  try {
    let Pid = req.params.productId;

    if (!isValidObjectId(Pid)) {
      return res.status(400).send({
        status: false,
        message: "Invalid Product ID please Provide Valid Credential",
      });
    }

    const findProductDb = await productModel.findOneAndUpdate({
      _id: Pid,
      isDeleted: false,
    }, { isDeleted: true, deletedAt: new Date() }, { new: true });

    if (!findProductDb) {
      return res
        .status(404)
        .send({ status: false, message: "Data Not Found Or Already Deleted" });
    }

    return res.status(200).send({
      status: true,
      message: "Deleted Successfully"
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
