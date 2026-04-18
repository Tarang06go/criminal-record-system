const jwt = require("jsonwebtoken");

// ⚠️ MUST match the secret used in authRoutes.js when signing tokens
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token is required."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action."
      });
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};