const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({}, { timestamp: true });

module.exports = mongoose.model("Users", UserSchema);
