const mongoose = require("mongoose");

const productShema= new mongoose.Schema({

},{ timestamps: true})

module.exports=mongoose.model("product",productShema);