const { Order } = require("../models/order.models");
const { eUser } = require("../models/user.models");

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deliveryAddress = req.body.deliveryAddress;

    // Find the user's cart items
    const user = await eUser.findById(userId).populate("cart");
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = user.cart.map((cartItem) => ({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      selectedSize: cartItem.selectedSize,
      priceDetails: cartItem.priceDetails,
    }));

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.priceDetails.price * item.quantity,
      0
    );

    const newOrder = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
    });

    // Clearing the user's cart
    user.cart = [];
    await user.save();

    return res
      .status(201)
      .json({ message: "Order placed successfully", newOrder });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Function to get user orders
const getUserOrders = async (req) => {
  try {
    const userId = req.user.userId;
    const userOrders = await Order.find({ userId })
      .populate({
        path: "items.productId",
        model: "ShoesProducts",
        select: "title price images brand", // Ensure 'title' is selected
      })
      .populate("deliveryAddress");

    return userOrders;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteOrder = async (req) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const result = await Order.deleteOne({ _id: orderId, userId });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { getUserOrders, placeOrder, deleteOrder };
