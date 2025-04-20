const { Order } = require("../models/order.models");
const { eUser } = require("../models/user.models");

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deliveryAddress = req.body.deliveryAddress;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body.paymentInfo;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Incomplete Razorpay payment data" });
    }
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
      paymentInfo: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });

    user.cart = [];
    await user.save();
    const populatedOrder = await Order.findById(newOrder._id).populate(
      "deliveryAddress"
    );
    return res
      .status(201)
      .json({ message: "Order placed successfully", newOrder: populatedOrder });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const getUserOrders = async (req) => {
  try {
    const userId = req.user.userId;
    const userOrders = await Order.find({ userId })
      .populate({
        path: "items.productId",
        model: "ShoesProducts",
        select: "title price images brand",
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
