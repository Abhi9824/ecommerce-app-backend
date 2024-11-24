const { eUser } = require("../models/user.models");
const bcrypt = require("bcryptjs");

const signUp = async (userDetails) => {
  const { username, name, email, password } = userDetails;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = {
      name,
      username: username,
      email,
      password: hashPassword,
    };

    const user = new eUser(newUser);
    await user.save();
    return user;
  } catch (error) {
    console.log("Error in Signing Up", error);
  }
};

const login = async (user, password) => {
  try {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return user;
    } else {
      throw new Error("Incorrect Password");
    }
  } catch (error) {
    console.log("Login Failed.Incorrect Details");
  }
};

const getUserById = async (userId) => {
  try {
    const user = await eUser.findById(userId).populate("cart");
    return user.save();
  } catch (error) {
    console.log("No User Exist");
  }
};

const deleteUserById = async (userId) => {
  try {
    const deletedUser = await eUser.findByIdAndDelete(userId);
    return deletedUser;
  } catch (error) {
    throw new Error("Failed to delete the user.Try again!");
  }
};

const getAllUsers = async () => {
  try {
    const allUsers = await eUser.find();
    return allUsers;
  } catch (error) {
    console.log("Error getting all users", error);
  }
};

const updateUserDetails = async (userId, dataToUpdate) => {
  try {
    const user = await eUser.findByIdAndUpdate({ _id: userId }, dataToUpdate, {
      new: true,
    });
    await user.save();
    return user;
  } catch (error) {
    throw new Error("Error getting updating the details.");
  }
};

module.exports = {
  updateUserDetails,
  getAllUsers,
  getUserById,
  deleteUserById,
  login,
  signUp,
};
