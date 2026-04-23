const express = require("express");
const { pool } = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

function toOptionalPositiveInteger(value) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

//////////////////////////////////////////////////////////
// CREATE CRIMINAL (ADMIN ONLY)
//////////////////////////////////////////////////////////

router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can add criminals" });
    }

    const { name, dob, gender, address, phone } = req.body;

    if (!name || !dob) {
      return res.status(400).json({ success: false, message: "Name and DOB are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO criminals (name, dob, gender, address, phone) VALUES (?, ?, ?, ?, ?)`,
      [name, dob, gender, address, phone]
    );

    return res.status(201).json({
      success: true,
      message: "Criminal created successfully",
      data: { criminal_id: result.insertId, name, dob, gender, address, phone }
    });

  } catch (error) {
    console.error("CREATE CRIMINAL ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

//////////////////////////////////////////////////////////
// GET ALL CRIMINALS (ROLE BASED)
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

    if (req.user.role === "officer") {
      query += `
        WHERE c.criminal_id IN (
          SELECT criminal_id FROM cases WHERE officer_id = ?
        )
      `;
      params.push(req.user.officerId);
    }

    query += " ORDER BY c.criminal_id";

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, data: rows });

  } catch (error) {
    console.error("GET CRIMINALS ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

//////////////////////////////////////////////////////////
// GET SINGLE CRIMINAL
//////////////////////////////////////////////////////////

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const criminalId = toOptionalPositiveInteger(req.params.id);
    if (!criminalId) {
      return res.status(400).json({ success: false, message: "Valid criminal ID required" });
    }

    const [rows] = await pool.query(
      `SELECT * FROM criminals WHERE criminal_id = ?`, [criminalId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Criminal not found" });
    }

    return res.json({ success: true, data: rows[0] });

  } catch (error) {
    console.error("GET SINGLE CRIMINAL ERROR:", error.message);
    return res.status(500).json({ success: false });
  }
});

//////////////////////////////////////////////////////////
// DELETE CRIMINAL (ADMIN ONLY)
//
// Strategy: disable FK checks → delete everything linked
// to this criminal → re-enable FK checks.
// This is the simplest and most reliable approach for a
// demo project — no missing-table errors, no FK cascades
// to think about.
//////////////////////////////////////////////////////////

router.delete("/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Only admin can delete criminals" });
  }

  const criminalId = toOptionalPositiveInteger(req.params.id);
  if (!criminalId) {
    return res.status(400).json({ success: false, message: "Valid criminal ID required" });
  }

  // Check criminal exists first
  const [existing] = await pool.query(
    `SELECT criminal_id FROM criminals WHERE criminal_id = ?`, [criminalId]
  );
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: "Criminal not found" });
  }

  const conn = await pool.getConnection();

  try {
    // Disable FK checks — bypasses ALL foreign key constraints
    await conn.query(`SET FOREIGN_KEY_CHECKS = 0`);

    // Get linked case IDs so we can delete their children too
    const [linkedCases] = await conn.query(
      `SELECT case_id FROM cases WHERE criminal_id = ?`, [criminalId]
    );
    const caseIds = linkedCases.map((r) => r.case_id);

    if (caseIds.length > 0) {
      await conn.query(`DELETE FROM witnesses              WHERE case_id IN (?)`, [caseIds]);
      await conn.query(`DELETE FROM evidences              WHERE case_id IN (?)`, [caseIds]);
      await conn.query(`DELETE FROM case_assignments       WHERE case_id IN (?)`, [caseIds]);
      await conn.query(`DELETE FROM criminal_prison_assignments WHERE case_id IN (?)`, [caseIds]);

      // Delete sentence_log only if the table exists
      await conn.query(`DELETE FROM sentence_log     WHERE case_id IN (?)`, [caseIds]).catch(() => {});
      await conn.query(`DELETE FROM case_audit_log   WHERE case_id IN (?)`, [caseIds]).catch(() => {});
    }

    // Delete cases
    await conn.query(`DELETE FROM cases WHERE criminal_id = ?`, [criminalId]);

    // Get linked offence IDs
    const [linkedOffences] = await conn.query(
      `SELECT offence_id FROM offences WHERE criminal_id = ?`, [criminalId]
    );
    const offenceIds = linkedOffences.map((r) => r.offence_id);

    if (offenceIds.length > 0) {
      await conn.query(`DELETE FROM victims WHERE offence_id IN (?)`, [offenceIds]);
    }

    await conn.query(`DELETE FROM offences WHERE criminal_id = ?`, [criminalId]);
    await conn.query(`DELETE FROM criminal_prison_assignments WHERE criminal_id = ?`, [criminalId]);

    // Delete the criminal
    await conn.query(`DELETE FROM criminals WHERE criminal_id = ?`, [criminalId]);

    // Re-enable FK checks
    await conn.query(`SET FOREIGN_KEY_CHECKS = 1`);

    return res.json({
      success: true,
      message: "Criminal and all linked records deleted successfully"
    });

  } catch (error) {
    // Always re-enable FK checks even if something failed
    await conn.query(`SET FOREIGN_KEY_CHECKS = 1`).catch(() => {});
    console.error("DELETE CRIMINAL ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Delete failed: " + error.message
    });
  } finally {
    conn.release();
  }
});

module.exports = router;