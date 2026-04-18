const express = require("express");
const crypto = require("crypto");
const { pool } = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔐 HASH FUNCTION
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return `100000:${salt}:${hash}`;
}

// 🔹 GET ALL OFFICERS
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT officer_id, name, officer_rank, phone, email, station
      FROM police_officers
      ORDER BY officer_id
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error("GET OFFICERS ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// 🔹 ADD OFFICER + CREATE LOGIN
router.post("/", authenticateToken, async (req, res) => {
  try {
    // 🔒 Only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can add officers"
      });
    }

    const { name, officer_rank, phone, email, station } = req.body;

    if (!name || !email || !officer_rank) {
      return res.status(400).json({
        success: false,
        message: "Name, Rank and Email required"
      });
    }

    // ✅ Check duplicate email
    const [existing] = await pool.query(
      "SELECT officer_id FROM police_officers WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Officer with this email already exists"
      });
    }

    // insert officer
    await pool.query(
      `INSERT INTO police_officers (name, officer_rank, phone, email, station)
       VALUES (?, ?, ?, ?, ?)`,
      [name, officer_rank, phone, email, station]
    );

    // create login
    const defaultPassword = "default123";
    const hashed = hashPassword(defaultPassword);

    await pool.query(
      `INSERT INTO login_users (username, password_hash, role)
       VALUES (?, ?, 'officer')`,
      [email, hashed]
    );

    res.json({
      success: true,
      message: "Officer created successfully",
      login: {
        username: email,
        password: defaultPassword
      }
    });

  } catch (err) {
    console.error("ADD OFFICER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Error creating officer"
    });
  }
});


// 🔹 DELETE OFFICER
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const id = req.params.id;

    // 🔥 UNASSIGN FIRST
    await pool.query(
      "UPDATE cases SET officer_id = NULL WHERE officer_id = ?",
      [id]
    );

    const [rows] = await pool.query(
      "SELECT email FROM police_officers WHERE officer_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    const email = rows[0].email;

    await pool.query(
      "DELETE FROM police_officers WHERE officer_id = ?",
      [id]
    );

    await pool.query(
      "DELETE FROM login_users WHERE username = ?",
      [email]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;