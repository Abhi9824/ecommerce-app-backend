const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    title: { type: String, required: true },
    price: { type: Number, required: true },

    description: { type: [String], required: true },
    features: {
      type: [String],
      required: true,
    },
    gender: {
      type: [String],
      enum: ["Mens", "Womens", "Unisex"],
      required: true,
    },
    size: {
      type: [String],
      enum: ["S", "M", "L", "6", "7", "8", "9", "10", "11", "12", "XL", "XXL"],
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    category: {
      type: [String],
      enum: [
        "Sneaker",
        "Running",
        "StreetWear",
        "Luxury",
        "SneakerCare",
        "Casual",
      ],
      required: true,
    },
    isWishlist: {
      type: Boolean,
      default: false,
      required: true,
    },
    isInCart: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ShoesProducts = mongoose.model("ShoesProducts", productSchema);

module.exports = { ShoesProducts };
