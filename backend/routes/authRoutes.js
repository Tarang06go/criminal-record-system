const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const { pool } = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Helper: Get officer profile
async function getOfficerProfileByEmail(email) {
  const [rows] = await pool.query(
    `
    SELECT
      officer_id,
      name,
      officer_rank,
      phone,
      email,
      station
    FROM police_officers
    WHERE email = ?
    `,
    [email]
  );

  return rows[0] || null;
}

// 🔐 LOGIN ROUTE (NO HASHING)
router.post(
  "/login",
  [
    body("username").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required")
  ],
  async (req, res) => {
    try {

      // ✅ Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array()
        });
      }

      const { username, password } = req.body;

      // 🔍 Fetch user
      const [rows] = await pool.query(
        `
        SELECT username, password_hash, role
        FROM login_users
        WHERE username = ?
        `,
        [username]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }

      const user = rows[0];

      // ✅ SIMPLE PASSWORD CHECK (NO HASHING)
      if (password !== user.password_hash) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }

      // 👮 Officer profile
      const officerProfile =
        user.role === "officer"
          ? await getOfficerProfileByEmail(user.username)
          : null;

      // 🔑 JWT SECRET
      const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

      // 🔑 Generate token
      const token = jwt.sign(
        {
          username: user.username,
          role: user.role,
          officerId: officerProfile?.officer_id || null
        },
        JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "8h"
        }
      );

      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          username: user.username,
          role: user.role,
          officer: officerProfile
        }
      });

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Server error during login"
      });
    }
  }
);

// 🔐 GET CURRENT USER
router.get("/me", authenticateToken, async (req, res) => {
  try {

    const officerProfile =
      req.user.role === "officer"
        ? await getOfficerProfileByEmail(req.user.username)
        : null;

    return res.json({
      success: true,
      user: {
        username: req.user.username,
        role: req.user.role,
        officer: officerProfile
      }
    });

  } catch (error) {
    console.error("GET /me ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user profile"
    });
  }
});

module.exports = router;