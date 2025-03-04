const express = require("express");
const User = require("../models/user.models");
const bcrypt = require("bcrypt");
const router = express.Router();
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth");
const emailValid = require("../middlewares/emailValid");
dotenv.config();
const secretKey = process.env.JWT_Secret;

router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password, confirmPassword } = req.body;

  if (!firstname) {
    return res
      .status(400)
      .json({ message: "First name required*", errorType: "firstname" });
  }
  if (!lastname) {
    return res
      .status(400)
      .json({ message: "Last name required*", errorType: "lastname" });
  }

  if (!email) {
    return res
      .status(400)
      .json({ message: "Please enter email*", errorType: "email" });
  }

  if (!emailValid(email)) {
    return res.status(400).json({
      message: "Invalid email format, ex: u@g.com",
      errorType: "email",
    });
  }

  if (!password) {
    return res
      .status(400)
      .json({ message: "Please enter your password*", errorType: "password" });
  }

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    return res.status(400).json({ message: "Email already exist", errorType: "email" });
  }

  const passwordCheck =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordCheck.test(password)) {
    return res.status(400).json({
      message:
        "Please choose a strong password that is at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*).",
      errorType: "password",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Password did not match",
      errorType: "confirmPassword",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashPassword,
    });
    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json({ message: "Invalid email", errorType: "email" });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(400).json({
      message: "The password you entered is incorrect",
      errorType: "password",
    });
  }
  try {
    const payload = {
      id: user._id,
    };
    const token = await jwt.sign(payload, secretKey);
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "User cannot login", error: error.message });
  }
});

router.post("/username", authMiddleware, async (req, res) => {
  const { username } = req.body;
  const userId = req.user.id;

  if (!username) {
    return res
      .status(400)
      .json({ message: "Username required*", errorType: "username" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isUsernameExist = await User.findOne({ username });
    if (isUsernameExist && isUsernameExist._id.toString() !== userId) {
      return res
        .status(400)
        .json({ message: "Username already taken", errorType: "username" });
    }

    user.username = username;
    await user.save();
    return res.status(200).json({ message: "Username added successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/update-profile", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { bio, username, bannerBackground } = req.body;

  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    return res.status(400).json({ message: "User does not exist" });
  }
  try {
    if (bio) isUserExist.bio = bio;
    if (username) isUserExist.username = username;
    if (bannerBackground) isUserExist.bannerBackground = bannerBackground;

    // Save the updated user data
    await isUserExist.save();

    return res
      .status(200)
      .json({ message: "User updated successfully", isUserExist });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/update-user-info", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { firstname, lastname, email, password } = req.body;

  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    return res.status(400).json({ message: "User does not exist" });
  }
  try {
    if (email) {
      if (!emailValid(email)) {
        return res
          .status(400)
          .json({ message: "Invalid email", errorType: "email" });
      }
      const isEmailExist = await User.findOne({ email });
      if (isEmailExist) {
        return res
          .status(400)
          .json({ message: "Email already exist", errorType: "email" });
      }
      isUserExist.email = email;
    }
    if (firstname) isUserExist.firstname = firstname;
    if (lastname) isUserExist.lastname = lastname;
    if (password) {
      const passwordCheck =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordCheck.test(password)) {
        return res.status(400).json({
          message:
            "Please choose a strong password that is at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character(!@#$%^&*).",
          errorType: "password",
        });
      }
    }

    await isUserExist.save();
    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// router.delete("/delete", authMiddleware, async (req, res) => {
//   const userId = req.user.id;
//   if (!userId) {
//     return res.status(400).json({ message: "Missing credentials" });
//   }
//   try {
//     await User.findByIdAndDelete(userId);
//     return res.status(200).json({
//       message: "User deleted successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// });

module.exports = router;
