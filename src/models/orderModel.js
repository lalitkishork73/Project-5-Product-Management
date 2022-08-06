const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderShema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "user", trim: true, required: true },
    items: [
      {
        productId: {
          type: ObjectId,
          ref: "product",
          trim: true,
          required: true,
        },
        quantity: {
          type: Number,
          trim: true,
          required: true,
          min: 1,
        },
        _id:false
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
    totalQuantity: {
      type: Number,
      required: true,
      trim: true,
    },
    cancellable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "completed", "cancled"],
    },
    deletedAt: { type: Date },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", orderShema);
