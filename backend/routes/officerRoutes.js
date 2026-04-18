const express = require("express");
const { pool } = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 GET ALL OFFICERS (admin + officer can view)
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


// 🔹 ADD OFFICER + CREATE LOGIN (admin only, plain text password)
router.post("/", authenticateToken, async (req, res) => {
  try {
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

    // Check duplicate email
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

    // Insert officer
    await pool.query(
      `INSERT INTO police_officers (name, officer_rank, phone, email, station)
       VALUES (?, ?, ?, ?, ?)`,
      [name, officer_rank, phone, email, station]
    );

    // ✅ Store plain text password (NO HASHING)
    const defaultPassword = "default123";

    await pool.query(
      `INSERT INTO login_users (username, password_hash, role)
       VALUES (?, ?, 'officer')`,
      [email, defaultPassword]
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


// 🔹 DELETE OFFICER (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const id = req.params.id;

    // Unassign from cases first to avoid FK constraint errors
    await pool.query(
      "UPDATE cases SET officer_id = NULL WHERE officer_id = ?",
      [id]
    );

    const [rows] = await pool.query(
      "SELECT email FROM police_officers WHERE officer_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Officer not found" });
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

    res.json({ success: true, message: "Officer deleted" });

  } catch (err) {
    console.error("DELETE OFFICER ERROR:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;