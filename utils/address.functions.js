const { AddressDetails } = require("../models/address.models");
const { Cart } = require("../models/cart.models");
const { eUser } = require("../models/user.models");

const addAddress = async (userId, addressData) => {
  try {
    const user = await eUser.findById(userId).populate("address");

    if (!user) {
      throw new Error("User Not Found");
    } else {
      const address = new AddressDetails(addressData);
      await address.save();
      user.address.push(address._id.toHexString());
      await user.save();
      return address;
    }
  } catch (error) {
    throw error;
  }
};

const updateAddress = async (userId, addressId, addressToUpdate) => {
  try {
    const user = await eUser.findById(userId);
    if (!user || !user.address.includes(addressId)) {
      throw new Error("Address not associated with the user");
    }
    const address = await AddressDetails.findByIdAndUpdate(
      addressId,
      addressToUpdate,
      { new: true }
    );
    if (!address) {
      throw new Error("Address not found");
    }
    return address;
  } catch (error) {
    throw error;
  }
};

const deleteAddress = async (userId, addressId) => {
  try {
    const user = await eUser.findById(userId);
    if (!user || !user.address.includes(addressId)) {
      throw new Error("Address not associated with the user");
    }

    const address = await AddressDetails.findByIdAndDelete(addressId);
    if (!address) {
      throw new Error("Address not found");
    }
    user.address = user.address.filter((id) => id.toString !== addressId);
    await user.save();
    return address;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

const getAllAddress = async (userId) => {
  try {
    const user = await eUser.findById(userId).populate("address");
    if (!user) {
      throw new Error("User not found!");
    }
    return user.address;
  } catch (error) {
    throw new Error("Error retrieving address", error);
  }
};

module.exports = { deleteAddress, addAddress, updateAddress, getAllAddress };
