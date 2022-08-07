const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { uploadFile } = require("./awsConnect.js");

const {
  isValid,
  isValidRequestBody,
  isValidName,
  isvalidEmail,
  moblieRegex,
  isValidObjectId,
  isValidPassword,
  regexUrl,
} = require("../utils/util");

//<<================================= User Resgister ============================>>//

const userRegister = async function (req, res) {
  try {
    let files = req.files;

    let userDetails = req.body;
    let { fname, lname, email, phone, password, address } = userDetails;

    if (!isValidRequestBody(userDetails)) {
      return res
        .status(400)
        .send({ status: false, message: "please provide user Details" });
    }

    if (!isValid(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "first name is required" });
    }

    if (!isValidName(fname))
      return res
        .status(400)
        .send({ status: false, message: "Name must contain only alphabates" });

    if (!isValid(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "last name is required" });
    }

    if (!isValidName(lname))
      return res.status(400).send({
        status: false,
        message: "Last Name must contain only alphabates",
      });

    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email-ID is required" });
    }

    if (!isvalidEmail(email))
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

    if (!moblieRegex(phone))
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
    if (!isValidPassword(password))
      return res.status(400).send({
        status: false,
        message: `Password ${password}  must include atleast one special character[@$!%?&], one uppercase, one lowercase, one number and should be mimimum 8 to 15 characters long`,
      });

    if (!isValid(address))
      return res
        .status(400)
        .send({ status: false, message: "Address is a mandatory field" });
    address = JSON.parse(address);

    if (!isValid(address.shipping) || !isValid(address.billing))
      return res.status(400).send({
        status: false,
        message: "Shipping and Billing address are mandatory field",
      });

    if (
      !isValid(address.shipping.street) ||
      !isValid(address.shipping.city) ||
      !isValid(address.shipping.pincode)
    )
      return res.status(400).send({
        status: false,
        message: "Street, city and pincode are mandatory in Shipping",
      });

    if (
      !isValid(address.billing.street) ||
      !isValid(address.billing.city) ||
      !isValid(address.billing.pincode)
    )
      return res.status(400).send({
        status: false,
        message: "Street, city and pincode are mandatory in Billing",
      });

    /********************************************** Create Phase **********************************************/

    let userImage = await uploadFile(files[0]);

    if (!regexUrl(userImage)) {
      return res.status(400).send({
        status: false,
        message: "NOt Valid URL created by S3",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    profileImage = userImage;
    password = hashedPassword;

    const userData = {
      address,
      fname,
      lname,
      email,
      profileImage,
      phone,
      password,
    };

    const saveUserInDb = await userModel.create(userData);

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

    if (!isValidRequestBody(body))
      return res
        .status(400)
        .send({ status: false, message: "Body Should not be empty" });

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Please enter email" });

    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, message: "email should not be empty" });

    if (!isvalidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid email" });

    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Please enter password" });

    if (!isValid(password))
      return res
        .status(400)
        .send({ status: false, message: "Password should not be empty" });

    let user = await userModel.findOne({ email: email });

    if (!user)
      return res
        .status(401)
        .send({ status: false, message: "Please use valid credentials" });

    bcrypt.compare(password, user.password, function (err, result) {
      hasAccess(result);
    });

    function hasAccess(result) {
      if (result) {
        // insert login code here
        console.log("Access Granted!");
        let token = jwt.sign(
          {
            userId: user._id.toString(),
            Project: "Product Management",
            Group: "27",
          },
          "project-5-group27",
          { expiresIn: "24h" }
        );
        // res.setHeader("x-api-key", token);
        res.setHeader("Authorization", "Bearer ", token);

        return res.status(200).send({
          status: true,
          message: "Successfully loggedin",
          userId: user._id,
          token: token,
        });
      } else {
        // insert access denied code here
        console.log("Access Denied!");
        return res.status(401).send({
          status: false,
          message: "loggeding denied ",
        });
      }
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//<<================================= Get Profile ============================>>//

const getProfile = async function (req, res) {
  try {
    let userId = req.params.userId;

  
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "Invalid UserId" });
    }

    const userDetail = await userModel.findOne({ _id: userId });
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

//<<================================= UpdateProfile ============================>>//

const UpdateProfile = async function (req, res) {
  try {
    const userId = req.params.userId;
    const formData = req.files;
    const updateData = req.body;

    let data = {
      isDeleted: false,
    };

    const checkFromDb = await userModel.findOne({ _id: userId });

    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "invalid user Id" });
    let findUserId = await userModel.findOne({ _id: userId });
    if (!findUserId)
      return res.status(404).send({ status: false, message: "user not found" });

    if (!isValidRequestBody(updateData) && !formData)
      return res
        .status(400)
        .send({ status: false, message: "please provide data to update" });
    const { fname, lname, email, phone, password } = updateData;
    let address = req.body.address;

    if (formData.length !== 0) {
      let updateProfileImage = await uploadFile(formData[0]);
      data["profileImage"] = updateProfileImage;
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

      if (!isvalidEmail(email))
        return res
          .status(400)
          .send({ status: false, message: "Invalid Email id." });

      if (!checkFromDb.email) {
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

      if (!checkFromDb.phone) {
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

      data["password"] = await bcrypt.hash(password, 10);
    }

    if (address) {
      if (!isValid(address)) {
        return res
          .status(400)
          .send({ status: false, message: " address is not valid" });
      } else if (address) {
        let address1 = JSON.parse(address.shipping);

        if (address1.shipping) {
          const { street, city, pincode } = address1.shipping;
          if (street) {
            if (!isValid(street))
              return res.status(400).send({
                status: false,
                message: "shipping street is not valid ",
              });
            data["address.shipping.street"] = street;
          }
          if (city) {
            if (!isValid(city))
              return res.status(400).send({
                status: false,
                message: "shipping city is not valid ",
              });
            data["address.shipping.city"] = city;
          }

          if (pincode) {
            if (!isValid(pincode))
              return res.status(400).send({
                status: false,
                message: "shipping pincode is not valid ",
              });
            data["address.shipping.pincode"] = pincode;
          }
        }

        if (address1.billing) {
          const { street, city, pincode } = address1.billing;

          if (street) {
            if (!isValid(street))
              return res.status(400).send({
                status: false,
                message: "billing street is not valid ",
              });
            data["address.billing.street"] = street;
          }
          if (city) {
            if (!isValid(city))
              return res
                .status(400)
                .send({ status: false, message: "billing city is not valid " });
            data["address.billing.city"] = city;
          }
          if (pincode) {
            if (!isValid(pincode))
              return res.status(400).send({
                status: false,
                message: "billing pincode is not valid ",
              });
            data["address.billing.pincode"] = pincode;
          }
        }
      }
    }

    const UpdateProfile = await userModel.findOneAndUpdate(
      { _id: userId },
      data,
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
