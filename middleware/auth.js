const jwt = require("jsonwebtoken");

// Verify JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "your_super_secret_jwt_key_change_this_in_production"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Check if user is a teacher
exports.isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res
      .status(403)
      .json({ error: "Access denied. Teacher role required." });
  }
  next();
};

// Check if user is a student
exports.isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ error: "Access denied. Student role required." });
  }
  next();
};
