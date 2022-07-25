const mongoose = require("mongoose");

const orderShema= new mongoose.Schema({

},{ timestamps: true})

module.exports = mongoose.model("order", orderShema);