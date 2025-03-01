const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({ message: "This action is not allowed" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_Secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;