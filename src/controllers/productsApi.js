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
// enum is not supported 
const createProducts = async function(req, res) {
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


        // availableSizes = availableSizes.toUpperCase().split(",");
        // console.log(availableSizes)

        if (file && file.length > 0) {
            let url = await uploadFile(file[0]);
            data["productImage"] = url;
        } else {
            return res
                .status(400)
                .send({ status: false, msg: "Please Provide ProductImage" });
        }

        // if (availableSizes.length < 1) {
        //     return res.status(400).send({ status: false, msg: "please enter size of product" })
        // }
        // if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) == -1) {
        //     return res.status(400).send({ status: false, data: "Enter a valid size S or XS or M or X or L or XXL or XL ", });
        // }

        let sizes = availableSizes;

        console.log(sizes);
        if (availableSizes.length == 0) {
            return res
                .status(400)
                .send({ status: false, message: "please provide the product sizes" });
        }

        for (let i = 0; i < sizes.length; i++) {
            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizes[i])) {
                return res.status(400).send({
                    status: false,
                    message: `Sizes should be ${[
            "S",
            "XS",
            "M",
            "X",
            "L",
            "XXL",
            "XL",
          ]}value(with multiple size seperated by comma)`,
                });
            }
        }

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
const getProducts = async function(req, res) {
    try {
        const inputs = req.query;

        let filterData = {};
        filterData.isDeleted = false;

        if (!validString(inputs.size)) {
            return res
                .status(400)
                .send({ status: false, msg: "Please Provide a Valid Size!" });
        }
        if (inputs.size) {
            let sizes = inputs.size.split(",").map((x) => x.trim());
            filterData["availableSizes"] = sizes;
        }

        if (!validString(inputs.name)) {
            return res
                .status(400)
                .send({ status: false, msg: "Please Provide a Name Of the Product!" });
        }

        if (inputs.name) {
            filterData["title"] = {};
            filterData["title"]["$regex"] = inputs.name; //$regex to match the subString
            filterData["title"]["$options"] = "i"; //"i" for case insensitive.
        }

        if (!validString(inputs.priceGreaterThan)) {
            return res.status(400).send({
                status: false,
                msg: "Please Provide a Lowest Price Of the Product!",
            });
        }
        if (!validString(inputs.priceLessThan)) {
            return res.status(400).send({
                status: false,
                msg: "Please Provide a Highest Price Of the Product!",
            });
        }
        if (inputs.priceGreaterThan || inputs.priceLessThan) {
            filterData.price = {};

            if (inputs.priceGreaterThan) {
                if (isNaN(Number(inputs.priceGreaterThan))) {
                    return res.status(400).send({
                        status: false,
                        message: `priceGreaterThan should be a valid number`,
                    });
                }
                if (inputs.priceGreaterThan <= 0) {
                    return res.status(400).send({
                        status: false,
                        message: `priceGreaterThan shouldn't be 0 or-ve number`,
                    });
                }

                filterData["price"]["$gte"] = Number(inputs.priceGreaterThan);
            }

            if (inputs.priceLessThan) {
                if (isNaN(Number(inputs.priceLessThan))) {
                    return res.status(400).send({
                        status: false,
                        message: `priceLessThan should be a valid number`,
                    });
                }
                if (inputs.priceLessThan <= 0) {
                    return res.status(400).send({
                        status: false,
                        message: `priceLessThan can't be 0 or -ve`,
                    });
                }

                filterData["price"]["$lte"] = Number(inputs.priceLessThan);
            }
        }

        if (!validString(inputs.priceSort)) {
            return res.status(400).send({
                status: false,
                msg: "Please Sort 1 for Ascending -1 for Descending order!",
            });
        }

        if (inputs.priceSort) {
            if (!(inputs.priceSort == 1 || inputs.priceSort == -1)) {
                return res
                    .status(400)
                    .send({ status: false, message: `priceSort should be 1 or -1 ` });
            }

            console.log(filterData);
            const products = await productModel
                .find(filterData)
                .sort({ price: inputs.priceSort });

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
                p: products.length,
            });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

//<<============================Get Product By Id ==============================>>//

const getProductbyId = async function(req, res) {
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
// enum is not supported 
const updateProductbyId = async function(req, res) {
    try {
        let id = req.params.productId;
        if (!isValidObjectId(id))
            return res
                .status(400)
                .send({ status: false, message: "Enter Id in valid Format" });

        let data = await productModel.findById(id);
        if (!data)
            return res
                .status(404)
                .send({ status: false, message: "No Data found wih this ID" });
        if (data.isDeleted == true) {
            return res
                .status(404)
                .send({ status: false, message: "This product is Deleted" });
        }

        let body = req.body;
        let files = req.files;
        if (!files) {
            if (isValidBody(body))
                return res
                    .status(400)
                    .send({ status: false, message: "Pls enter Some Data To update" });
        }
        let {
            title,
            description,
            price,
            productImage,
            style,
            availableSizes,
            installments,
        } = body;

        if ("title" in body) {
            if (!isValid(title))
                return res
                    .status(400)
                    .send({ status: false, message: "Title should not be empty" });
            if (!isValidTName(title))
                return res
                    .status(400)
                    .send({ status: false, message: "Enter Valid Title Name" });
            if (await productModel.findOne({ title: title }))
                return res
                    .status(400)
                    .send({ status: false, message: `${title} is already exists` });
            data.title = title;
        }
        if ("description" in body) {
            if (!isValid(description))
                return res
                    .status(400)
                    .send({ status: false, message: "Description should not be empty" });
            data.description = description;
        }
        if ("price" in body) {
            if (!isValid(price))
                return res
                    .status(400)
                    .send({ status: false, message: "Price should not be empty" });
            data.price = price;
        }
        if ("isFreeShipping" in body) {
            if (!isValid(isFreeShipping))
                return res
                    .status(400)
                    .send({
                        status: false,
                        message: "isFreeShipping should not be empty",
                    });
            if (typeof isFreeShipping !== "boolean")
                return res
                    .status(400)
                    .send({
                        status: false,
                        message: "isFreeShipping should be only True False",
                    });
            data.isFreeShipping = isFreeShipping;
        }
        if (files && files.length > 0) {
            if (!isValidImg(files[0].mimetype)) {
                return res
                    .status(400)
                    .send({
                        status: false,
                        message: "Image Should be of JPEG/ JPG/ PNG",
                    });
            }
            let uploadedFileURL = await uploadFile(files[0]);
            data.productImage = uploadedFileURL;
        }
        if ("style" in body) {
            if (!isValid(style))
                return res
                    .status(400)
                    .send({ status: false, message: "Style should not be empty" });
            if (!isValidTName(style))
                return res
                    .status(400)
                    .send({ status: false, message: "Pls Enter Valid Style Category" });
            data.style = style;
        }
        if ("availableSizes" in body) {
            if (!isValid(availableSizes))
                return res
                    .status(400)
                    .send({
                        status: false,
                        message: "AvailableSizes should not be empty",
                    });
            if (!isValidSize(availableSizes))
                return res
                    .status(400)
                    .send({
                        status: false,
                        message: " Sizes should be from these ['S', 'XS','M','X', 'L','XXL','XL']",
                    });
            data.availableSizes = availableSizes;
        }

        if ("installments" in body) {
            if (!isValid(installments))
                return res
                    .status(400)
                    .send({ status: false, message: "installments should not be empty" });
            if (typeof installments !== Number)
                return res
                    .status(400)
                    .send({
                        status: false,
                        message: "Installments Should be Of Number Type",
                    });
            data.installments = installments;
        }

        data.save();
        res
            .status(200)
            .send({ status: true, message: "Updated Successfully", data: data });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

//<<============================ Delete Product By Id ==============================>>//

const deleteProductbyId = async function(req, res) {
    try {
        let Pid = req.params.productId;

        if (!isValid(Pid) && !isValidObjectId(Pid)) {
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