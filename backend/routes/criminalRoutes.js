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
// YOUR SCHEMA FK MAP (from criminal_record_management.sql):
//
//   criminal_prison_assignments.criminal_id → criminals  RESTRICT  ← blocks criminal delete
//   criminal_prison_assignments.case_id     → cases      CASCADE   ← auto-deletes when case deleted
//   cases.criminal_id                       → criminals  RESTRICT  ← blocks criminal delete
//   offences.criminal_id                    → criminals  RESTRICT  ← blocks criminal delete
//   victims.offence_id                      → offences   CASCADE   ← auto-deletes when offence deleted
//   witnesses.case_id                       → cases      CASCADE   ← auto-deletes when case deleted
//   evidences.case_id                       → cases      CASCADE   ← auto-deletes when case deleted
//   case_assignments.case_id                → cases      CASCADE   ← auto-deletes when case deleted
//   sentence_log / case_audit_log           → NO FK      ← safe to delete anytime
//
// CORRECT DELETE ORDER:
//   1. criminal_prison_assignments (by criminal_id) — RESTRICT on criminal, must go first
//   2. sentence_log + case_audit_log (by case_id)  — no FK, safe anytime
//   3. cases (by criminal_id)                       — CASCADE cleans witnesses/evidences/case_assignments
//   4. offences (by criminal_id)                    — CASCADE cleans victims
//   5. criminals                                    — now safe, nothing references it
//////////////////////////////////////////////////////////

router.delete("/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Only admin can delete criminals" });
  }

  const criminalId = toOptionalPositiveInteger(req.params.id);
  if (!criminalId) {
    return res.status(400).json({ success: false, message: "Valid criminal ID required" });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Confirm criminal exists
    const [check] = await conn.query(
      `SELECT criminal_id FROM criminals WHERE criminal_id = ?`, [criminalId]
    );
    if (check.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Criminal not found" });
    }

    // Get all case IDs for this criminal (needed for log cleanup)
    const [linkedCases] = await conn.query(
      `SELECT case_id FROM cases WHERE criminal_id = ?`, [criminalId]
    );
    const caseIds = linkedCases.map((r) => r.case_id);

    // STEP 1 — criminal_prison_assignments
    // Has RESTRICT on criminal_id → MUST be deleted before cases AND criminals
    await conn.query(
      `DELETE FROM criminal_prison_assignments WHERE criminal_id = ?`,
      [criminalId]
    );

    // STEP 2 — sentence_log and case_audit_log (no FK, cleanup only)
    if (caseIds.length > 0) {
      await conn.query(`DELETE FROM sentence_log   WHERE case_id IN (?)`, [caseIds]);
      await conn.query(`DELETE FROM case_audit_log WHERE case_id IN (?)`, [caseIds]);
    }

    // STEP 3 — cases
    // ON DELETE CASCADE automatically removes:
    //   witnesses, evidences, case_assignments (all have CASCADE on case_id)
    await conn.query(
      `DELETE FROM cases WHERE criminal_id = ?`, [criminalId]
    );

    // STEP 4 — offences
    // ON DELETE CASCADE automatically removes victims (CASCADE on offence_id)
    await conn.query(
      `DELETE FROM offences WHERE criminal_id = ?`, [criminalId]
    );

    // STEP 5 — criminal (now nothing references it)
    await conn.query(
      `DELETE FROM criminals WHERE criminal_id = ?`, [criminalId]
    );

    await conn.commit();

    return res.json({
      success: true,
      message: "Criminal and all linked records deleted successfully"
    });

  } catch (error) {
    await conn.rollback();
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