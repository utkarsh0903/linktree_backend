const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Username is required"],
  },
  lastname: String,
  category: String,
  username: {
    type: String,
    unique: [true, "Username should be unique"],
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