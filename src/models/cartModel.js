const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartShema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "user",
      required: "userId is required",
      trim: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: ObjectId,
          ref: "product",
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          trim: true,
          min: 1,
        },
        _id: false,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      trim: true,
    },

    totalItems: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("cart", cartShema);
