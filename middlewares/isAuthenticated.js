import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "User not authenticated", success: false });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded || !decoded.userId) {
      return res
        .status(401)
        .json({ message: "Invalid token payload", success: false });
    }

    req.id = decoded.userId;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res
      .status(401)
      .json({ message: "Authentication failed", success: false });
  }
};

export default isAuthenticated;
