const express = require("express");
const { pool } = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

//////////////////////////////////////////////////////
// 🔹 GET CASES (ROLE BASED)
//////////////////////////////////////////////////////

router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT 
        c.case_id,
        c.court_name,
        c.lawyer_assigned,
        c.verdict,
        c.sentence,
        c.criminal_id,
        cr.name AS criminal_name,
        c.officer_id,
        po.name AS assigned_officer
      FROM cases c
      LEFT JOIN criminals cr ON c.criminal_id = cr.criminal_id
      LEFT JOIN police_officers po ON c.officer_id = po.officer_id
    `;

    let params = [];

    // 👮 Officer sees only his cases
    if (req.user.role === "officer") {
      query += " WHERE c.officer_id = ?";
      params.push(req.user.officerId);
    }

    query += " ORDER BY c.case_id";

    const [rows] = await pool.query(query, params);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error("GET CASES ERROR:", err);
    res.status(500).json({ success: false });
  }
});

//////////////////////////////////////////////////////
// 🔹 CREATE CASE (ADMIN ONLY)
//////////////////////////////////////////////////////

router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { court_name, lawyer_assigned, verdict, criminal_id } = req.body;

    const [result] = await pool.query(
      `INSERT INTO cases (court_name, lawyer_assigned, verdict, criminal_id)
       VALUES (?, ?, ?, ?)`,
      [court_name, lawyer_assigned, verdict, criminal_id]
    );

    const [newCase] = await pool.query(
      `SELECT * FROM cases WHERE case_id = ?`,
      [result.insertId]
    );

    res.json({ success: true, data: newCase[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

//////////////////////////////////////////////////////
// 🔹 UPDATE SENTENCE (ADMIN ONLY)
//////////////////////////////////////////////////////

router.put("/:id/sentence", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { sentence } = req.body;

    await pool.query(
      "UPDATE cases SET sentence = ? WHERE case_id = ?",
      [sentence, req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

//////////////////////////////////////////////////////
// 🔹 ASSIGN OFFICER (ADMIN ONLY)
//////////////////////////////////////////////////////

router.put("/:id/assign", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { officer_id } = req.body;

    await pool.query(
      "UPDATE cases SET officer_id = ? WHERE case_id = ?",
      [officer_id, req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

//////////////////////////////////////////////////////
// 🔹 DELETE CASE (ADMIN ONLY)
//////////////////////////////////////////////////////

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await pool.query(
      "DELETE FROM cases WHERE case_id = ?",
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;