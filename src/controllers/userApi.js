const jwt = require("jsonwebtoken");
const userModel = require("../models/userModels");
const bcrypt = require("bcrypt");
const {uploadFile}= require('./awsConnect.js');

const {
  isValid,
  isValidRequestBody,
  isValidEmail,
  isValidPhone,
  isValidName,
  isStreetAddress,
  isCityAddress,
  isPincode,
} = require("../utils/util");

//<<================================= User Resgister ============================>>//

const userRegister = async function (req, res) {
  try {
    let files = req.files;

    let userDetails = req.body;
    let { fname, lname, email, phone, password, address } = userDetails;

    // if (!isValidRequestBody(userDetails)) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "please provide valid user Details" });
    // }

    if (!isValid(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "first name is required" });
    }
    if (!isValidName(fname && lname)) {
      return res.status(400).send({
        status: false,
        message: "Please Provide Alphabetical Order Name",
      });
    }
    if (!isValid(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "last name is required" });
    }

    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email-ID is required" });
    }

    if (!isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Invalid Email id." });

    const checkEmailFromDb = await userModel.findOne({ email: email });

    if (checkEmailFromDb) {
      return res.status(400).send({
        status: false,
        message: `emailId is Exists. Please try another email Id.`,
      });
    }

    if (!files.length) {
      return res
        .status(400)
        .send({ status: false, message: "Profile Image is required" });
    }

    if (!isValid(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "phone number is required" });
    }

    if (!isValidPhone(phone))
      return res.status(400).send({
        status: false,
        message: "Phone number must be a valid Indian number.",
      });

    const checkPhoneFromDb = await userModel.findOne({ phone: phone });

    if (checkPhoneFromDb) {
      return res.status(400).send({
        status: false,
        message: `${phone} is already in use, Please try a new phone number.`,
      });
    }

    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    }

    if (password.length < 8 || password.length > 15) {
      return res
        .status(400)
        .send({ status: false, message: "Password must be of 8-15 letters." });
    }

    if (!isValid(address)) {
      return res
        .status(400)
        .send({ status: false, message: "Address is required" });
    }

    let userAddress = JSON.parse(address);
    address = userAddress;
    const { shipping, billing } = userAddress;
    let { street, city, pincode } = shipping;
    let { street1, city1, pincode1 } = billing;

    if (!isValid(shipping && billing)) {
      return res.status(400).send({
        status: false,
        message: "Please provide Address shipping And Billing Address",
      });
    }

    /********************************************** Shipping Details **********************************************/

    if (!isValid(street)) {
      return res.status(400).send({
        status: false,
        message: "Please provide address shipping street",
      });
    }
    if (!isStreetAddress(street)) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid address shipping street",
      });
    }
    if (!isValid(city)) {
      return res.status(400).send({
        status: false,
        message: "Please provide address shipping city",
      });
    }
    if (!isCityAddress(city)) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid address shipping city",
      });
    }

    if (!(isValid(pincode) && Number.isInteger(Number(pincode)))) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid address shipping pincode",
      });
    }
    if (!isPincode(pincode)) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid address shipping pincode",
      });
    }

    /********************************************** Billing Details **********************************************/

    if (!isValid(street1)) {
      return res.status(400).send({
        status: false,
        message: "Please provide address billing street",
      });
    }
    if (!isStreetAddress(street1)) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid address billing street",
      });
    }
    if (!isValid(city1)) {
      return res.status(400).send({
        status: false,
        message: "Please provide address billing city",
      });
    }
    if (!isCityAddress(city1)) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid address billing city",
      });
    }
    if (!(isValid(pincode1) && Number.isInteger(Number(pincode1)))) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid address billing pincode",
      });
    }
    if (!isPincode(pincode1)) {
      return res.status(400).send({
        status: false,
        message: "Please provide valid address billing pincode",
      });
    }

    /********************************************** Create Phase **********************************************/

    let userImage = await aws_s3.uploadFile(files[0]);

    const hashedPassword = await bcrypt.hash(password, 10);

    profileImage = userImage;
    password = hashedPassword;

    const saveUserInDb = await userModel.create(userDetails);

    return res.status(201).send({
      status: true,
      message: "user created successfully!!",
      data: saveUserInDb,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<================================= User Login ============================>>//

const loginUser = async function (req, res) {
  try {
    let body = req.body;
    const { email, password } = body;

    if (isValidRequestBody(body))
      return res
        .status(400)
        .send({ status: false, message: "Body Should not be empty" });

    if (!("email" in body))
      return res
        .status(400)
        .send({ status: false, message: "Please enter email" });

    if (!("password" in body))
      return res
        .status(400)
        .send({ status: false, message: "Please enter password" });

    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, message: "email should not be empty" });

    if (!isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid email" });

    if (!isValid(password))
      return res
        .status(400)
        .send({ status: false, message: "Password should not be empty" });

    let user = await userModel.findOne({ email: email, password: password });

    if (!user)
      return res
        .status(401)
        .send({ status: false, message: "Please use valid credentials" });

    let token = jwt.sign(
      {
        userId: user._id.toString(),
        Project: "Product Management",
        Group: "27",
      },
      "project-5-group27",
      { expiresIn: "24h" }
    );

    return res.status(200).send({
      status: true,
      message: "Successfully loggedin",
      userId: user._id,
      token: token,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getProfile = async function (req, res) {
  try {
    userId = req.body.userId;
    if (!isValid.userId && !isValidObjectId.userId) {
      return res.status(400).send({ status: false, message: "Invalid UserId" });
    }
    let userDetail = await userModel.findById({ _id: userId });
    if (!userDetail) {
      return res
        .status(404)
        .send({ status: false, message: "userId not found" });
    }
    return res.status(200).send({
      status: true,
      message: "User profile details",
      data: userDetail,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const UpdateProfile = async function (req, res) {
  try {
    const userId = req.params.userId;
    const formData = req.files;
    const updateData = req.body;

    if (!isValidObjectId(userId))
      return res.status(400).send({ status: false, msg: "invalid user Id" });
    let findUserId = await userModel.findOne({ _id: userId });
    if (!findUserId)
      return res.status(404).send({ status: false, msg: "user not found" });

    if (!isValidRequestBody(updateData) && !formData)
      return res
        .status(400)
        .send({ status: false, msg: "please provide data to update" });
    const { address, fname, lname, email, phone, password } = updateData;

    if (formData.length !== 0) {
      let updateProfileImage = await aws.uploadFile(formData[0]);
      updateData.profileImage = updateProfileImage;
    }

    if (fname) {
      if (!isValid(fname)) {
        return res
          .status(400)
          .send({ status: false, message: "Provide valid Username" });
      }
    }
    if (lname) {
      if (!isValid(lname)) {
        return res
          .status(400)
          .send({ status: false, message: "Provide valid Username" });
      }
    }

    if (email) {
      if (!isValid(email)) {
        return res
          .status(400)
          .send({ status: false, message: "Email-ID is required" });
      }

      if (!isValidEmail(email))
        return res
          .status(400)
          .send({ status: false, message: "Invalid Email id." });

      if (!isValidEmail(email))
        return res
          .status(400)
          .send({ status: false, message: "Invalid Email id." });

      const checkEmailFromDb = await userModel.findOne({ email: email });

      if (checkEmailFromDb) {
        return res.status(400).send({
          status: false,
          message: `emailId is Exists. Please try another email Id.`,
        });
      }
    }

    if (phone) {
      if (!isValid(phone)) {
        return res
          .status(400)
          .send({ status: false, message: "phone number is required" });
      }

      if (!isValidPhone(phone))
        return res.status(400).send({
          status: false,
          message: "Phone number must be a valid Indian number.",
        });

      const checkPhoneFromDb = await userModel.findOne({ phone: phone });

      if (checkPhoneFromDb) {
        return res.status(400).send({
          status: false,
          message: `${phone} is already in use, Please try a new phone number.`,
        });
      }
    }
    if (password) {
      if (!isValid(password)) {
        return res
          .status(400)
          .send({ status: false, message: "password is required" });
      }

      if (password.length < 8 || password.length > 15) {
        return res.status(400).send({
          status: false,
          message: "Password must be of 8-15 letters.",
        });
      }
    }

    if (address) {
      if (!isValid(address)) {
        return res
          .status(400)
          .send({ status: false, message: " address is not valid" });
      } else if (address) {
        let address1 = JSON.parse(address);
        const findAddress = await userModel.findOne({ _id: userId });
        let Shipping = findAddress.address.shipping;
        let Biling = findAddress.address.billing;

        if (address1.shipping) {
          const { street, city, pincode } = address1.shipping;
          if (street) {
            if (!isValid(street))
              return res
                .status(400)
                .send({ status: false, msg: "shipping street is not valid " });
            Shipping.street = street;
          }
          if (city) {
            if (!isValid(city))
              return res
                .status(400)
                .send({ status: false, msg: "shipping city is not valid " });
            Shipping.city = city;
          }
          if (pincode) {
            if (!isValid(pincode))
              return res
                .status(400)
                .send({ status: false, msg: "shipping pincode is not valid " });
            Shipping.pincode = pincode;
          }
        }

        if (address1.billing) {
          const { street, city, pincode } = address1.billing;
          if (street) {
            if (!isValid(street))
              return res
                .status(400)
                .send({ status: false, msg: "billing street is not valid " });
            Biling.street = street;
          }
          if (city) {
            if (!isValid(city))
              return res
                .status(400)
                .send({ status: false, msg: "billing city is not valid " });
            Biling.city = city;
          }
          if (pincode) {
            if (!isValid(pincode))
              return res
                .status(400)
                .send({ status: false, msg: "billing pincode is not valid " });
            Biling.pincode = pincode;
          }
        }
        updateData.address = findAddress.address;
      }
    }

    const UpdateProfile = await userModel.findOne(
      { _id: userId },
      { updateData },
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "User profile updated successfully",
      data: UpdateProfile,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { userRegister, loginUser, getProfile, UpdateProfile };
