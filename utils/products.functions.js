const { ShoesProducts } = require("../models/products.model");

const createProduct = async (productDetails) => {
  try {
    const products = {
      brand: productDetails.brand,
      images: productDetails.images,
      title: productDetails.title,
      price: productDetails.price,
      description: productDetails.description,
      features: productDetails.features,
      size: productDetails.size,
      category: productDetails.category,
      isInCart:
        productDetails.isInCart !== undefined ? productDetails.isInCart : false, // default to false
    };
    const newProduct = new ShoesProducts(products);
    await newProduct.save();
    return newProduct;
  } catch (error) {
    console.log("Error creating new product", error);
  }
};
const getProductById = async (productId) => {
  try {
    const products = await ShoesProducts.findById(productId);
    return products;
  } catch (error) {
    console.log("Error fetching product by ID", error);
    throw error;
  }
};
const updateProductDetails = async (productId, productDetails) => {
  try {
    const updateProduct = await ShoesProducts.findByIdAndUpdate(
      productId,
      productDetails,
      { new: true }
    );

    return updateProduct;
  } catch (error) {
    console.log("Error fetching product by ID", error);
    throw error;
  }
};
const deleteProduct = async (productId) => {
  try {
    const product = await ShoesProducts.findByIdAndDelete(productId);
    return product;
  } catch (error) {
    res.status(500).json({ error: "Internal Server error", error });
  }
};

const getProductByCategoryGender = async (categoryGender) => {
  try {
    const normalizedCategoryGender = categoryGender.replace(/^(.)/, (match) =>
      match.toUpperCase()
    );

    console.log(normalizedCategoryGender);
    const product = await ShoesProducts.find({
      gender: normalizedCategoryGender,
    });

    return product;
  } catch (error) {
    throw error;
  }
};
const getProductByBrandName = async (brandName) => {
  try {
    const products = await ShoesProducts.find({
      brand: brandName,
    });
    return products;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  createProduct,
  getProductById,
  updateProductDetails,
  deleteProduct,
  getProductByCategoryGender,
  getProductByBrandName,
};
