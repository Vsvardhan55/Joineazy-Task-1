const pool = require("../config/db");

// Get current student's submission status for an assignment
const getMySubmission = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const groupId = req.query.group_id
      ? parseInt(req.query.group_id)
      : null;

    if (Number.isNaN(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    let query = `
      SELECT
        s.id,
        s.assignment_id,
        s.group_id,
        s.student_id,
        s.confirmed,
        s.confirmed_at,
        g.name AS group_name,
        a.title AS assignment_title
      FROM submissions s
      JOIN groups g ON g.id = s.group_id
      JOIN assignments a ON a.id = s.assignment_id
      WHERE s.assignment_id = $1
        AND s.student_id = $2
    `;

    const params = [assignmentId, req.user.id];

    if (groupId) {
      query += " AND s.group_id = $3";
      params.push(groupId);
    }

    query += " ORDER BY s.id LIMIT 1";

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        submitted: false,
        submission: null,
      });
    }

    res.json({
      success: true,
      submitted: result.rows[0].confirmed,
      submission: result.rows[0],
    });
  } catch (error) {
    console.error("Get submission error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get submission status",
    });
  }
};


// Confirm assignment submission
const confirmSubmission = async (req, res) => {
  const client = await pool.connect();

  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const groupId = parseInt(req.body.group_id);

    if (Number.isNaN(assignmentId) || Number.isNaN(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Valid assignment ID and group ID are required",
      });
    }

    await client.query("BEGIN");

    // Check whether student belongs to group
    const memberResult = await client.query(
      `
      SELECT gm.id
      FROM group_members gm
      JOIN users u ON u.id = gm.student_id
      WHERE gm.group_id = $1
        AND gm.student_id = $2
        AND u.role = 'STUDENT'
      `,
      [groupId, req.user.id]
    );

    if (memberResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Check whether assignment is assigned to this group
    const assignmentResult = await client.query(
      `
      SELECT a.id, a.title
      FROM assignments a
      JOIN assignment_groups ag
        ON ag.assignment_id = a.id
      WHERE a.id = $1
        AND ag.group_id = $2
      `,
      [assignmentId, groupId]
    );

    if (assignmentResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        success: false,
        message: "This assignment is not assigned to your group",
      });
    }

    // Check existing confirmation
    const existingResult = await client.query(
      `
      SELECT id, confirmed
      FROM submissions
      WHERE assignment_id = $1
        AND group_id = $2
        AND student_id = $3
      `,
      [assignmentId, groupId, req.user.id]
    );

    if (
      existingResult.rows.length > 0 &&
      existingResult.rows[0].confirmed
    ) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message: "Submission already confirmed",
      });
    }

    let result;

    if (existingResult.rows.length > 0) {
      result = await client.query(
        `
        UPDATE submissions
        SET confirmed = TRUE,
            confirmed_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [existingResult.rows[0].id]
      );
    } else {
      result = await client.query(
        `
        INSERT INTO submissions
          (assignment_id, group_id, student_id, confirmed, confirmed_at)
        VALUES
          ($1, $2, $3, TRUE, CURRENT_TIMESTAMP)
        RETURNING *
        `,
        [assignmentId, groupId, req.user.id]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Assignment submission confirmed successfully",
      submission: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Confirm submission error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to confirm submission",
    });
  } finally {
    client.release();
  }
};


// Get group progress for an assignment
const getGroupProgress = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const assignmentId = req.query.assignment_id
      ? parseInt(req.query.assignment_id)
      : null;

    if (Number.isNaN(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    // Verify student is a member of the group
    const memberCheck = await pool.query(
      `
      SELECT id
      FROM group_members
      WHERE group_id = $1
        AND student_id = $2
      `,
      [groupId, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    let query = `
      SELECT
        a.id AS assignment_id,
        a.title,
        a.due_date,
        COUNT(DISTINCT gm.student_id) AS total_students,
        COUNT(DISTINCT CASE
          WHEN s.confirmed = TRUE THEN s.student_id
        END) AS confirmed_students
      FROM assignments a
      JOIN assignment_groups ag
        ON ag.assignment_id = a.id
      JOIN group_members gm
        ON gm.group_id = ag.group_id
      LEFT JOIN submissions s
        ON s.assignment_id = a.id
        AND s.group_id = ag.group_id
        AND s.student_id = gm.student_id
      WHERE ag.group_id = $1
    `;

    const params = [groupId];

    if (assignmentId) {
      query += " AND a.id = $2";
      params.push(assignmentId);
    }

    query += `
      GROUP BY a.id, a.title, a.due_date
      ORDER BY a.due_date ASC
    `;

    const result = await pool.query(query, params);

    const assignments = result.rows.map((row) => {
      const totalStudents = Number(row.total_students);
      const confirmedStudents = Number(row.confirmed_students);

      const progress =
        totalStudents === 0
          ? 0
          : Math.round((confirmedStudents / totalStudents) * 100);

      return {
        assignment_id: row.assignment_id,
        title: row.title,
        due_date: row.due_date,
        total_students: totalStudents,
        confirmed_students: confirmedStudents,
        progress,
        completed: progress === 100,
      };
    });

    res.json({
      success: true,
      group_id: groupId,
      assignments,
    });
  } catch (error) {
    console.error("Group progress error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get group progress",
    });
  }
};

const getAdminSubmissionTracking = async (req, res) => {
  try {
    const { assignment_id } = req.query;

    let query = `
      SELECT
        a.id AS assignment_id,
        a.title AS assignment_title,
        a.due_date,

        g.id AS group_id,
        g.name AS group_name,

        u.id AS student_id,
        u.name AS student_name,
        u.email,
        u.student_id AS student_code,

        COALESCE(s.confirmed, false) AS confirmed,
        s.confirmed_at

      FROM assignments a

      INNER JOIN assignment_groups ag
        ON a.id = ag.assignment_id

      INNER JOIN groups g
        ON ag.group_id = g.id

      INNER JOIN group_members gm
        ON g.id = gm.group_id

      INNER JOIN users u
        ON gm.student_id = u.id

      LEFT JOIN submissions s
        ON s.assignment_id = a.id
        AND s.group_id = g.id
        AND s.student_id = u.id
    `;

    const values = [];

    if (assignment_id) {
      query += ` WHERE a.id = $1`;
      values.push(assignment_id);
    }

    query += `
      ORDER BY
        a.due_date ASC,
        g.name ASC,
        u.name ASC
    `;

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      tracking: result.rows,
    });
  } catch (error) {
    console.error("Admin submission tracking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load submission tracking",
    });
  }
};


module.exports = {
  getMySubmission,
  confirmSubmission,
  getGroupProgress,
  getAdminSubmissionTracking,
};