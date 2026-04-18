const express = require("express");
const { pool } = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Helper
function toOptionalPositiveInteger(value) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

//////////////////////////////////////////////////////////
// 🔹 CREATE CRIMINAL (ADMIN ONLY)
//////////////////////////////////////////////////////////

router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can add criminals"
      });
    }

    const { name, dob, gender, address, phone } = req.body;

    if (!name || !dob) {
      return res.status(400).json({
        success: false,
        message: "Name and DOB are required"
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO criminals (name, dob, gender, address, phone)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, dob, gender, address, phone]
    );

    return res.status(201).json({
      success: true,
      message: "Criminal created successfully",
      data: {
        criminal_id: result.insertId,
        name,
        dob,
        gender,
        address,
        phone
      }
    });

  } catch (error) {
    console.error("CREATE CRIMINAL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});

//////////////////////////////////////////////////////////
// 🔹 GET ALL CRIMINALS (ROLE BASED)
//////////////////////////////////////////////////////////

router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT
        c.criminal_id,
        c.name,
        c.dob,
        TIMESTAMPDIFF(YEAR, c.dob, CURDATE()) AS age,
        c.gender,
        c.address,
        c.phone
      FROM criminals c
    `;

    let params = [];

    // 👮 OFFICER → ONLY HIS CRIMINALS
    if (req.user.role === "officer") {
      query += `
        WHERE c.criminal_id IN (
          SELECT criminal_id
          FROM cases
          WHERE officer_id = ?
        )
      `;
      params.push(req.user.officerId);
    }

    query += " ORDER BY c.criminal_id";

    const [rows] = await pool.query(query, params);

    return res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error("GET CRIMINALS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});

//////////////////////////////////////////////////////////
// 🔹 GET SINGLE CRIMINAL
//////////////////////////////////////////////////////////

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const criminalId = toOptionalPositiveInteger(req.params.id);

    if (!criminalId) {
      return res.status(400).json({
        success: false,
        message: "Valid criminal ID required"
      });
    }

    const [rows] = await pool.query(
      `SELECT * FROM criminals WHERE criminal_id = ?`,
      [criminalId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Criminal not found"
      });
    }

    return res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error("GET SINGLE CRIMINAL ERROR:", error);
    return res.status(500).json({
      success: false
    });
  }
});

//////////////////////////////////////////////////////////
// 🔹 DELETE CRIMINAL (ADMIN ONLY)
//////////////////////////////////////////////////////////

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete criminals"
      });
    }

    const criminalId = toOptionalPositiveInteger(req.params.id);

    if (!criminalId) {
      return res.status(400).json({
        success: false,
        message: "Valid criminal ID required"
      });
    }

    const [result] = await pool.query(
      `DELETE FROM criminals WHERE criminal_id = ?`,
      [criminalId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Criminal not found"
      });
    }

    return res.json({
      success: true,
      message: "Criminal deleted successfully"
    });

  } catch (error) {
    console.error("DELETE CRIMINAL ERROR:", error);
    return res.status(500).json({
      success: false
    });
  }
});

module.exports = router;