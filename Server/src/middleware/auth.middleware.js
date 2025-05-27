import jwt from "jsonwebtoken";
import Constants from "../constant.js";
import { userModel } from "../models/user.schema.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Check if Authorization header exists and is in correct format
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: "failed", message: "Unauthorized: No token provided" });
    }

    // 2. Get token
    const token = authHeader.split(" ")[1];

    // 3. Verify token
    const decoded = jwt.verify(token, Constants.SECRET_KEY);

    // 4. Get user from decoded data
    const user = await userModel.findById(decoded.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "User not found" });
    }

    // 5. Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res
      .status(401)
      .json({ status: "failed", message: "Invalid or expired token" });
  }
};


let checkAdmin = (req, res, next) => {
    let { role } = req.user;
    if (role !== "admin") {
        return res.status(401).json({status: "failed", message: "Only admin can access"})
    }
    next()
}

export {authMiddleware, checkAdmin}