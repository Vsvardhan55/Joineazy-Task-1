const pool = require("../config/db");

// ==========================================
// CREATE ASSIGNMENT
// ==========================================
const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      due_date,
      onedrive_link,
      group_ids = [],
    } = req.body;

    const adminId = req.user.id;

    if (!title || !due_date || !onedrive_link) {
      return res.status(400).json({
        success: false,
        message: "Title, due date and OneDrive link are required",
      });
    }

    if (!Array.isArray(group_ids)) {
      return res.status(400).json({
        success: false,
        message: "group_ids must be an array",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

await client.query(
  `
  UPDATE assignments
  SET
    title = $1,
    description = $2,
    due_date = $3,
    onedrive_link = $4
  WHERE id = $5
  `,
  [
    title,
    description,
    due_date,
    onedrive_link,
    assignmentId,
  ]
);

await client.query(
  `
  DELETE FROM assignment_groups
  WHERE assignment_id = $1
  `,
  [assignmentId]
);

for (const groupId of group_ids) {
  await client.query(
    `
    INSERT INTO assignment_groups
      (assignment_id, group_id)
    VALUES ($1, $2)
    ON CONFLICT (assignment_id, group_id)
    DO NOTHING
    `,
    [assignmentId, groupId]
  );
}

await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Create assignment error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating assignment",
    });
  }
};

// ==========================================
// GET ALL ASSIGNMENTS
// ==========================================
const getAssignments = async (req, res) => {
  try {
    let result;

    if (req.user.role === "ADMIN") {
      // Admin can see all assignments
      result = await pool.query(`
        SELECT
          a.id,
          a.title,
          a.description,
          a.due_date,
          a.onedrive_link,
          a.created_by,
          a.created_at,
          COUNT(DISTINCT ag.group_id) AS assigned_group_count
        FROM assignments a
        LEFT JOIN assignment_groups ag
          ON ag.assignment_id = a.id
        GROUP BY a.id
        ORDER BY a.due_date ASC
      `);
    } else {
      // Student can only see assignments assigned
      // to groups they belong to
      result = await pool.query(
        `
        SELECT DISTINCT
          a.id,
          a.title,
          a.description,
          a.due_date,
          a.onedrive_link,
          a.created_by,
          a.created_at,
          g.id AS group_id,
          g.name AS group_name
        FROM assignments a
        JOIN assignment_groups ag
          ON ag.assignment_id = a.id
        JOIN groups g
          ON g.id = ag.group_id
        JOIN group_members gm
          ON gm.group_id = g.id
        WHERE gm.student_id = $1
        ORDER BY a.due_date ASC
        `,
        [req.user.id]
      );
    }

    res.json({
      success: true,
      assignments: result.rows,
    });
  } catch (error) {
    console.error("Get assignments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get assignments",
    });
  }
};

// ==========================================
// GET ASSIGNMENT BY ID
// ==========================================
const getAssignmentById = async (req, res) => {
  try {
    const assignmentId = req.params.id;

    const assignmentResult = await pool.query(
      `SELECT
          a.id,
          a.title,
          a.description,
          a.due_date,
          a.onedrive_link,
          a.created_by,
          a.created_at
       FROM assignments a
       WHERE a.id = $1`,
      [assignmentId]
    );

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const groupsResult = await pool.query(
      `SELECT
          g.id,
          g.name
       FROM assignment_groups ag
       INNER JOIN groups g
          ON ag.group_id = g.id
       WHERE ag.assignment_id = $1
       ORDER BY g.name`,
      [assignmentId]
    );

    res.json({
      success: true,
      assignment: assignmentResult.rows[0],
      groups: groupsResult.rows,
    });
  } catch (error) {
    console.error("Get assignment error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching assignment",
    });
  }
};

// ==========================================
// UPDATE ASSIGNMENT
// ==========================================
const updateAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const adminId = req.user.id;

    const {
      title,
      description,
      due_date,
      onedrive_link,
    } = req.body;

    const existing = await pool.query(
      `SELECT id
       FROM assignments
       WHERE id = $1 AND created_by = $2`,
      [assignmentId, adminId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or access denied",
      });
    }

    if (!title || !due_date || !onedrive_link) {
      return res.status(400).json({
        success: false,
        message: "Title, due date and OneDrive link are required",
      });
    }

    const result = await pool.query(
      `UPDATE assignments
       SET title = $1,
           description = $2,
           due_date = $3,
           onedrive_link = $4
       WHERE id = $5
       RETURNING id, title, description, due_date,
                 onedrive_link, created_by, created_at`,
      [
        title.trim(),
        description || null,
        due_date,
        onedrive_link.trim(),
        assignmentId,
      ]
    );

    res.json({
      success: true,
      message: "Assignment updated successfully",
      assignment: result.rows[0],
    });
  } catch (error) {
    console.error("Update assignment error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating assignment",
    });
  }
};

// ==========================================
// DELETE ASSIGNMENT
// ==========================================
const deleteAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const adminId = req.user.id;

    const result = await pool.query(
      `DELETE FROM assignments
       WHERE id = $1 AND created_by = $2
       RETURNING id`,
      [assignmentId, adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or access denied",
      });
    }

    res.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting assignment",
    });
  }
};

// ==========================================
// ASSIGN ASSIGNMENT TO GROUPS
// ==========================================
const assignToGroups = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const adminId = req.user.id;
    const { group_ids } = req.body;

    if (!Array.isArray(group_ids) || group_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "group_ids must be a non-empty array",
      });
    }

    // Check assignment belongs to this admin
    const assignment = await pool.query(
      `SELECT id
       FROM assignments
       WHERE id = $1 AND created_by = $2`,
      [assignmentId, adminId]
    );

    if (assignment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found or access denied",
      });
    }

    for (const groupId of group_ids) {
      await pool.query(
        `INSERT INTO assignment_groups
           (assignment_id, group_id)
         VALUES ($1, $2)
         ON CONFLICT (assignment_id, group_id) DO NOTHING`,
        [assignmentId, groupId]
      );
    }

    res.status(201).json({
      success: true,
      message: "Assignment assigned to groups successfully",
      assignment_id: Number(assignmentId),
      group_ids,
    });
  } catch (error) {
    console.error("Assign groups error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while assigning groups",
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  assignToGroups,
};