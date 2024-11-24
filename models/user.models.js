const mongoose = require("mongoose");

const { AddressDetails } = require("./address.models");
const { Cart } = require("./cart.models");
const { ShoesProducts } = require("./products.model");

const eUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AddressDetails",
      },
    ],

    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShoesProducts",
      },
    ],
  },
  { timestamps: true }
);

const eUser = mongoose.model("eUser", eUserSchema);

module.exports = { eUser };
