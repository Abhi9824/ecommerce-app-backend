const { ShoesProducts } = require("../models/products.model");
const { eUser } = require("../models/user.models");

// Get all products in the wishlist
const getWishlist = async (userId) => {
  try {
    const user = await eUser.findById(userId).populate("wishlist");

    if (!user) {
      throw new Error("User not found");
    } else {
      return user.wishlist;
    }
  } catch (error) {
    throw new Error("Error fetching wishlist products: " + error.message);
  }
};

// Add a product to the wishlist
const addToWishlist = async (userId, productId) => {
  try {
    const user = await eUser.findById(userId).populate("wishlist");
    if (!user) {
      throw new Error("User not found");
    } else {
      const product = await ShoesProducts.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }
      console.log("Jo productId", productId);
      const isProductInWishlist = user.wishlist.find(
        (item) => item._id.toString() === productId
      );
      if (isProductInWishlist) {
        throw new Error("Product is already in the wishlist");
      }

      user.wishlist.push(product._id);
      product.isWishlist = true;
      await product.save();
      await user.save();
      return product;
    }
  } catch (error) {
    throw new Error("Error adding product to wishlist: " + error.message);
  }
};

// Remove a product from the wishlist
const removeFromWishlist = async (userId, productId) => {
  try {
    const user = await eUser.findById(userId).populate("wishlist");
    if (!user) {
      throw new Error("User not found");
    } else {
      const product = await ShoesProducts.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }
      const isProductInWishlist = user.wishlist.some(
        (prod) => prod._id.toString() === productId
      );
      if (!isProductInWishlist) {
        throw new Error("Product is not in the wishlist");
      }
      user.wishlist = user.wishlist.filter(
        (prod) => prod._id.toString() !== productId
      );
      product.isWishlist = false;
      await user.save();
      await product.save();
      return product;
    }
  } catch (error) {
    throw new Error("Error removing product from wishlist: " + error.message);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
