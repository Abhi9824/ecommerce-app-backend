// const {ShoesProducts}=require('../models/products.model')
const { Cart } = require("../models/cart.models");
const { ShoesProducts } = require("../models/products.model");
const { eUser } = require("../models/user.models");

const getAllCart = async (userId) => {
  try {
    const user = await eUser.findById(userId).populate({
      path: "cart",
      populate: {
        path: "productId", 
      },
    });
    if (!user) {
      throw new Error("User not found");
    } else {
      const products = await Cart.find().populate("productId");
      console.log(products);
      return user.cart;
    }
  } catch (error) {
    throw error;
  }
};

const addToCart = async (userId, { productId, quantity = 1, selectedSize }) => {
  try {
    const user = await eUser.findById(userId).populate("cart");
    if (!user) {
      throw new Error("User not found");
    } else {
      const product = await ShoesProducts.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }
      product.isInCart = true;
      product.isWishlist = false;
      await product.save();

      // Check if product already exists in the cart
      const existingCartItem = await Cart.findOne({
        userId,
        productId: product._id,
      });
      if (existingCartItem) {
        // If product already exists in cart, update the quantity and selected size
        existingCartItem.quantity += quantity; 
        existingCartItem.selectedSize = selectedSize; 
        await existingCartItem.save(); 
        return await existingCartItem.populate("productId"); 
      }
      // Create new cart item if it doesn't exist
      const newCartItem = new Cart({
        userId,
        productId: product._id,
        quantity,
        selectedSize,
        priceDetails: {
          price: product.price,
          discountedPrice: product.discountedPrice || 0,
        },
      });

      await newCartItem.save();
      user.cart.push(newCartItem._id.toHexString());
      await user.save();
      console.log("Item added to cart cart Successfully", newCartItem);
      return newCartItem.populate("productId");
    }
  } catch (error) {
    throw error;
  }
};

const removeFromCart = async (userId, productId) => {
  try {
    const user = await eUser.findById(userId).populate("cart");
    if (!user) {
      throw new Error("User not found");
    } else {
      // Find the cart item using productId
      const cartItem = await Cart.findOne({ productId: productId });

      if (!cartItem) {
        throw new Error("Product is not in the Cart");
      }

      // Remove the cart item if it exists
      await Cart.findByIdAndDelete(cartItem._id);
      user.cart = user.cart.filter((itemId) => itemId !== cartItem._id);
      await user.save();
      return cartItem;
    }
  } catch (error) {
    throw error;
  }
};

const updateCart = async (userId, cartItemId, { quantity, selectedSize }) => {
  try {
    const user = await eUser.findById(userId).populate("cart");
    if (!user) {
      throw new Error("User not found");
    } else {
      console.log(`Updating cart item ${cartItemId} with quantity ${quantity}`);
      if (quantity < 1) {
        throw new Error("Quantity must be at least 1");
      }

      const updatedCartItem = await Cart.findByIdAndUpdate(
        cartItemId,
        { quantity, selectedSize },
        { new: true }
      ).populate("productId");

      if (!updatedCartItem) {
        throw new Error("Item not found in cart");
      }

      return updatedCartItem;
    }
  } catch (error) {
    console.error("Error in updateCart: ", error.message);
    throw error;
  }
};

module.exports = { updateCart, removeFromCart, addToCart, getAllCart };
