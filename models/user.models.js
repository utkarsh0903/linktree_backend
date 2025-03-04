const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Username is required"],
  },
  lastname: String,
  category: String,
  bio: {
    type: String,
    default: "Bio"
  },
  username: {
    type: String,
  },
  bannerBackground: {
    type: String,
    default: "#342B26"
  },
  email: {
    type: String,
    unique: [true, "Email should be unique"],
    required: [true, "Email is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;