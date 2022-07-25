const mongoose = require("mongoose");

const cartShema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model("cart", cartShema);
