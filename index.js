const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const razorpayInstance = require("./config/razorpay.config");
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();
app.use(express.json());
const cors = require("cors");
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://ecommerce-app-frontend-phi.vercel.app",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
const { initializeDatabase } = require("./db/db.connection");
const { ShoesProducts } = require("./models/products.model");
const { eUser } = require("./models/user.models");
initializeDatabase();
//utils
const {
  createProduct,
  getProductById,
  updateProductDetails,
  getProductByCategoryGender,
  getProductByBrandName,
} = require("./utils/products.functions");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("./utils/wishlist.functions");

const {
  updateUserDetails,
  getAllUsers,
  getUserById,
  deleteUserById,
  login,
  signUp,
} = require("./utils/user.functions");
const {
  getUserOrders,
  placeOrder,
  deleteOrder,
} = require("./utils/order.function");

const { authVerify } = require("./middleware/auth.verify.middleware");

app.get("/", async (req, res) => {
  res.send(`Welcome To Alcroz Shoping Platform`);
});

//products Routes
app.get("/products", async (req, res) => {
  try {
    const allProducts = await ShoesProducts.find();
    res.json(allProducts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/products", async (req, res) => {
  const productDetails = req.body;
  try {
    const newProduct = await createProduct(productDetails);
    if (newProduct) {
      res.status(201).json({ message: "Product created", data: newProduct });
    } else {
      res.status(401).json({ error: "Falied to add product" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to post the product", error });
  }
});

app.get("/products/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const products = await getProductById(productId);
    if (products) {
      res.status(201).json({ message: "Product Found", data: products });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Product Not Found", error });
  }
});

app.put("/products/:productId", async (req, res) => {
  const productDetails = req.body;
  const { productId } = req.params;
  try {
    const updateProduct = await updateProductDetails(productId, productDetails);
    if (updateProduct) {
      res
        .status(201)
        .json({ message: "Product updated successfully", data: updateProduct });
    } else {
      res.status(400).json({ message: "Failed to update products" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", error });
  }
});

app.delete("/products/:productId", async (req, res) => {
  const productId = req.params.id;
  try {
    const deleteProduct = await deleteProduct(productId);
    if (deleteProduct) {
      res
        .status(201)
        .json({ message: "Product deleted successfully", data: deleteProduct });
    } else {
      res.status(404).json({ message: "Product Deletion Failed" });
    }
  } catch (error) {}
});

//get products by categoryGender
app.get("/products/category/:categoryGender", async (req, res) => {
  try {
    const categoryProducts = await getProductByCategoryGender(
      req.params.categoryGender
    );
    res.status(200).json(categoryProducts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Service error", details: error.message });
  }
});

//get products by BrandName

app.get("/products/brand/:brandName", async (req, res) => {
  try {
    const allProducts = await getProductByBrandName(req.params.brandName);
    res.json(allProducts);
  } catch (error) {
    res.status(500).json({ error: "Internal Service error" });
  }
});

//wishlist api
app.get("/user/:userId/wishlist", authVerify, async (req, res) => {
  const { userId } = req.params;
  try {
    const allWishlistProducts = await getWishlist(userId);
    res.status(200).json(allWishlistProducts);
  } catch (error) {
    res.status(500).json({ error: "Internal Server error" });
  }
});

app.post("/user/:userId/wishlist", async (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;
  try {
    const addProducts = await addToWishlist(userId, productId);
    res
      .status(200)
      .json({ message: "Product added successfully", addProducts });
  } catch (error) {
    res.status(500).json({ error: "Internal Server error" });
  }
});

app.delete(
  "/user/:userId/wishlist/:productId",
  authVerify,
  async (req, res) => {
    const { userId, productId } = req.params;
    try {
      const removedProducts = await removeFromWishlist(userId, productId);

      if (!removedProducts) {
        res.status(400).json({
          message:
            "Failed to remove from the wishlist due to internal server error",
        });
      } else {
        res.status(200).json({
          message: "Successfully removed from the wishlist",
          data: removedProducts,
        });
      }
    } catch (error) {
      if (
        error.message === "User not found" ||
        error.message === "Product not found" ||
        error.message === "Product is not in the wishlist"
      ) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

//cart management api's
const { Cart } = require("./models/cart.models");
const {
  updateCart,
  removeFromCart,
  addToCart,
  getAllCart,
} = require("./utils/cart.functions");

// Route to get all items in the cart
app.get("/user/:userId/cart", authVerify, async (req, res) => {
  const { userId } = req.user;
  try {
    const cartItems = await getAllCart(userId);
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to add an item to the cart
app.post("/user/:userId/cart", authVerify, async (req, res) => {
  const { userId } = req.user;
  const { productId, quantity, selectedSize } = req.body;
  try {
    const newCartItem = await addToCart(userId, {
      productId,
      quantity,
      selectedSize,
    });
    res.status(201).json(newCartItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to update the quantity of an item in the cart
app.put("/user/:userId/cart/:id", authVerify, async (req, res) => {
  const { userId, id } = req.params;
  const { quantity, selectedSize } = req.body;
  try {
    const updatedCartItem = await updateCart(userId, id, {
      quantity,
      selectedSize,
    });
    res.status(200).json(updatedCartItem);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// Route to remove an item from the cart
app.delete("/user/:userId/cart/:id", authVerify, async (req, res) => {
  const { userId, id } = req.params;
  try {
    const removedItem = await removeFromCart(userId, id);
    res.status(200).json({ message: "Item removed from cart", removedItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//routes for the address
const { AddressDetails } = require("./models/address.models");
const {
  deleteAddress,
  addAddress,
  updateAddress,
  getAllAddress,
} = require("./utils/address.functions");

//add Address
app.post("/user/:userId/addresses", authVerify, async (req, res) => {
  const { userId } = req.params;
  const addressData = req.body;

  try {
    const address = await addAddress(userId, addressData);
    res.status(201).json({ message: "Addres added successfully", address });
  } catch (error) {
    console.error("Error adding address:", error);
    res
      .status(400)
      .json({ message: "Error Adding address", error: error.message });
  }
});

app.put("/user/:userId/addresses/:addressId", authVerify, async (req, res) => {
  const userId = req.params.userId;
  const addressId = req.params.addressId;
  try {
    const address = await updateAddress(userId, addressId, req.body);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json({ message: "Address updated successfully", address });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Error updating address", error: error.message });
  }
});

app.delete(
  "/user/:userId/addresses/:addressId",
  authVerify,
  async (req, res) => {
    const { userId, addressId } = req.params;
    try {
      const deletedAddress = await deleteAddress(userId, addressId);
      res
        .status(200)
        .json({ message: "Address deleted successfully", deletedAddress });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error deleting address", error: error.message });
    }
  }
);

app.get("/user/:userId/addresses", authVerify, async (req, res) => {
  const { userId } = req.params;
  try {
    const addresses = await getAllAddress(userId);
    res.status(200).json(addresses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving addresses", error: error.message });
  }
});
// Route to get user orders
app.get("/user/getOrders", authVerify, async (req, res) => {
  try {
    const orders = await getUserOrders(req);

    if (orders.length > 0) {
      res.status(200).json({ orders });
    } else {
      res.status(404).json({ message: "No orders found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

app.post("/user/createRazorpayOrder", authVerify, async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_order_" + Math.random(),
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({ razorpayOrder: order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Razorpay order failed", error: error.message });
  }
});

app.post("/user/verifyRazorpay", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Verification error", error: error.message });
  }
});

// Place order after verification
app.post("/user/placeOrder", authVerify, placeOrder);

//delete the orders
app.delete("/user/deleteOrder/:orderId", authVerify, async (req, res) => {
  try {
    const result = await deleteOrder(req);

    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Order deleted successfully" });
    } else {
      res.status(404).json({ message: "Order not found or already deleted" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

//users routes
app.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    if (users) {
      res.status(200).json({ message: "User found", data: users });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/user/signUp", async (req, res) => {
  const userDetails = req.body;
  const userExist = await eUser.findOne({ email: userDetails.email });
  if (userExist) {
    return res.status(403).json({ message: "Email already taken." });
  } else {
    try {
      const newUser = await signUp(userDetails);

      if (newUser) {
        const token = jwt.sign(
          { userId: newUser._id.toHexString(), username: newUser.username },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
        res.status(201).json({
          message: "SignUp Successful",
          data: { token, user: newUser },
        });
      } else {
        res.status(400).json({ message: "SignUp failed" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }
});

app.post("/user/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await eUser.findOne({ username }).populate("cart");
  if (!user) {
    res.status(401).json({ message: "Username not found" });
  } else {
    try {
      const loggedInUser = await login(user, password);
      if (loggedInUser) {
        const token = jwt.sign(
          {
            userId: loggedInUser._id,
          },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
        res
          .status(200)
          .json({ message: "Logged In", data: { token, user: loggedInUser } });
      } else {
        res.status(401).json({ message: "Incorrect Credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }
});

//get allUsers
app.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("user/profile", authVerify, async (req, res) => {
  const { userId } = req.user;
  try {
    const user = await getUserById(userId);
    if (user) {
      res.status(200).json({
        message: "User found",
        data: user,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Interanl Server Error", error });
  }
});

//get userProfileById
app.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await getUserById(userId);
    if (user) {
      res.status(200).json({ message: "User found", data: user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

//deleteUser
app.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await deleteUserById(userId);
    if (user) {
      res.status(200).json({ message: "User Deleted", data: user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Interanl Server Error", error });
  }
});

//update userDetails

app.put("/user/:id/update", async (req, res) => {
  const userId = req.params.id;
  const newUserDetails = req.body;
  try {
    const updateUserData = await updateUserDetails(userId, newUserDetails);

    if (updateUserData) {
      res
        .status(200)
        .json({ message: "UserDetails Updated", data: updateUserData });
    } else {
      res.status(400).json({ message: "Failed to updated" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
