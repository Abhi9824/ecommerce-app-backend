const mongoose = require("mongoose");
const { ShoesProducts } = require("./products.model");

const cartSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoesProducts",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    selectedSize: {
      type: String,
      required: true,
    },
    isWishlist: {
      type: Boolean,
      default: false,
    },
    priceDetails: {
      price: {
        type: Number,
        required: true,
      },
      discountedPrice: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = { Cart };
