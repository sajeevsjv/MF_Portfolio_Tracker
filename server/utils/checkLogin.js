import { errorResponse } from "./responseHandler.js";
import jwt from "jsonwebtoken";
import User from "../db/models/user.js";
import dotenv from "dotenv";
dotenv.config();

const checkLogin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log("authHeader:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response = errorResponse({
        statusCode: 400,
        message: "Invalid access token"
      });
      return res.status(response.statusCode).send(response);
    }

    const token = authHeader.split(' ')[1];
    console.log("token:", token);

    if (!token || token === "null" || token === "undefined") {
      const response = errorResponse({
        statusCode: 400,
        message: "Invalid access token"
      });
      return res.status(response.statusCode).send(response);
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        const response = errorResponse({
          statusCode: 400,
          message: err.message || "Token verification failed"
        });
        return res.status(response.statusCode).send(response);
      }

      console.log("decoded:", decoded);

      const user = await User.findOne({ _id: decoded.id });

      if (!user) {
        const response = errorResponse({
          statusCode: 404,
          message: "User not found"
        });
        return res.status(response.statusCode).send(response);
      }

      req.user = user;
      next();
    });

  } catch (error) {
    console.error("Authentication middleware error:", error);

    const response = errorResponse({
      statusCode: 500,
      message: error.message || "Internal server error"
    });
    return res.status(response.statusCode).send(response);
  }
};

export default checkLogin;
