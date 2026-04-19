const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
 
const { pool } = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");
const { verifyPassword } = require("../utils/password");
 
const router = express.Router();
 
// 🔹 Helper: Get officer profile
async function getOfficerProfileByEmail(email) {
  try {
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
  } catch (err) {
    console.error("OFFICER PROFILE ERROR:", err);
    return null;
  }
}
 
// 🔐 LOGIN ROUTE
router.post(
  "/login",
  [
    body("username").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array()
        });
      }
 
      const { username, password } = req.body;
 
      // ─── DEBUG ─────────────────────────────────────────────────────────────
      console.log("─── LOGIN ATTEMPT ──────────────────────────────────");
      console.log("  username received :", JSON.stringify(username));
      console.log("  password received :", JSON.stringify(password));
      // ───────────────────────────────────────────────────────────────────────
 
      const [rows] = await pool.query(
        `SELECT username, password_hash, role FROM login_users WHERE username = ?`,
        [username]
      );
 
      // ─── DEBUG ─────────────────────────────────────────────────────────────
      console.log("  rows found        :", rows.length);
      if (rows.length > 0) {
        console.log("  DB username       :", JSON.stringify(rows[0].username));
        console.log("  DB password_hash  :", JSON.stringify(rows[0].password_hash));
        console.log("  DB role           :", rows[0].role);
      }
      // ───────────────────────────────────────────────────────────────────────
 
      if (!rows || rows.length === 0) {
        console.log("  RESULT: no user found → 401");
        return res.status(401).json({ success: false, message: "Invalid username or password" });
      }
 
      const user = rows[0];
 
      const plainMatch  = password === user.password_hash;
      const hashedMatch = verifyPassword(password, user.password_hash);
 
      // ─── DEBUG ─────────────────────────────────────────────────────────────
      console.log("  plainMatch        :", plainMatch);
      console.log("  hashedMatch       :", hashedMatch);
      // ───────────────────────────────────────────────────────────────────────
 
      if (!plainMatch && !hashedMatch) {
        console.log("  RESULT: password mismatch → 401");
        return res.status(401).json({ success: false, message: "Invalid username or password" });
      }
 
      let officerProfile = null;
      if (user.role === "officer") {
        officerProfile = await getOfficerProfileByEmail(user.username);
        console.log("  officerProfile    :", officerProfile);
      }
 
      const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
 
      const token = jwt.sign(
        {
          username: user.username,
          role: user.role,
          officerId: officerProfile?.officer_id || null
        },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
      );
 
      console.log("  RESULT: login SUCCESS for role =", user.role);
      console.log("────────────────────────────────────────────────────");
 
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
      return res.status(500).json({ success: false, message: "Server error during login" });
    }
  }
);
 
// 🔐 GET CURRENT USER
router.get("/me", authenticateToken, async (req, res) => {
  try {
    let officerProfile = null;
 
    if (req.user.role === "officer") {
      officerProfile = await getOfficerProfileByEmail(req.user.username);
    }
 
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
    return res.status(500).json({ success: false, message: "Unable to fetch user profile" });
  }
});
 
module.exports = router;