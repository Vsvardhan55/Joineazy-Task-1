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
      submission_type = "GROUP",
      group_ids = [],
    } = req.body;

    const adminId = req.user.id;

    if (!title || !due_date || !onedrive_link) {
      return res.status(400).json({
        success: false,
        message: "Title, due date and OneDrive link are required",
      });
    }

    if (!["GROUP", "INDIVIDUAL"].includes(submission_type)) {
      return res.status(400).json({
        success: false,
        message: "submission_type must be GROUP or INDIVIDUAL",
      });
    }

    if (!Array.isArray(group_ids)) {
      return res.status(400).json({
        success: false,
        message: "group_ids must be an array",
      });
    }

    if (group_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one group",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const assignmentResult = await client.query(
        `
        INSERT INTO assignments
          (
            title,
            description,
            due_date,
            onedrive_link,
            submission_type,
            created_by
          )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          title,
          description,
          due_date,
          onedrive_link,
          submission_type,
          created_by,
          created_at
        `,
        [
          title.trim(),
          description?.trim() || null,
          due_date,
          onedrive_link.trim(),
          submission_type,
          adminId,
        ]
      );

      const assignment = assignmentResult.rows[0];

      for (const groupId of group_ids) {
        await client.query(
          `
          INSERT INTO assignment_groups
            (assignment_id, group_id)
          VALUES ($1, $2)
          ON CONFLICT (assignment_id, group_id)
          DO NOTHING
          `,
          [assignment.id, groupId]
        );
      }

      await client.query("COMMIT");

      return res.status(201).json({
        success: true,
        message: "Assignment created successfully",
        assignment,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Create assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating assignment",
    });
  }
};

// ==========================================
// GET ASSIGNMENTS
// ==========================================
const getAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // ADMIN / PROFESSOR
    if (role === "ADMIN") {
      const result = await pool.query(
        `
        SELECT
          a.id,
          a.title,
          a.description,
          a.due_date,
          a.onedrive_link,
          a.submission_type,
          a.created_by,
          a.created_at,
          COUNT(DISTINCT ag.group_id)::int AS assigned_group_count
        FROM assignments a
        LEFT JOIN assignment_groups ag
          ON ag.assignment_id = a.id
        WHERE a.created_by = $1
        GROUP BY a.id
        ORDER BY a.due_date ASC
        `,
        [userId]
      );

      return res.json({
        success: true,
        assignments: result.rows,
      });
    }

    // STUDENT
    const result = await pool.query(
      `
      SELECT DISTINCT
        a.id,
        a.title,
        a.description,
        a.due_date,
        a.onedrive_link,
        a.submission_type,
        a.created_by,
        a.created_at,
        g.id AS group_id,
        g.name AS group_name
      FROM assignments a
      INNER JOIN assignment_groups ag
        ON ag.assignment_id = a.id
      INNER JOIN groups g
        ON g.id = ag.group_id
      INNER JOIN group_members gm
        ON gm.group_id = g.id
      WHERE gm.student_id = $1
      ORDER BY a.due_date ASC
      `,
      [userId]
    );

    return res.json({
      success: true,
      assignments: result.rows,
    });
  } catch (error) {
    console.error("Get assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching assignments",
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
      `
      SELECT
        a.id,
        a.title,
        a.description,
        a.due_date,
        a.onedrive_link,
        a.submission_type,
        a.created_by,
        a.created_at
      FROM assignments a
      WHERE a.id = $1
      `,
      [assignmentId]
    );

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const groupsResult = await pool.query(
      `
      SELECT
        g.id,
        g.name,
        g.created_by AS group_created_by
      FROM assignment_groups ag
      INNER JOIN groups g
        ON ag.group_id = g.id
      WHERE ag.assignment_id = $1
      ORDER BY g.name
      `,
      [assignmentId]
    );

    const assignment = assignmentResult.rows[0];

    /*
     * If the request is for a particular group,
     * return that group's information directly.
     */
    const requestedGroupId = req.query.group_id
      ? Number(req.query.group_id)
      : null;

    let selectedGroup = null;

    if (requestedGroupId) {
      selectedGroup =
        groupsResult.rows.find(
          (group) =>
            Number(group.id) === requestedGroupId
        ) || null;
    }

    /*
     * If there is only one assigned group and no
     * group_id was supplied, use that group.
     */
    if (!selectedGroup && groupsResult.rows.length === 1) {
      selectedGroup = groupsResult.rows[0];
    }

    return res.json({
      success: true,

      assignment: {
        ...assignment,

        group_id: selectedGroup?.id || null,
        group_name: selectedGroup?.name || null,
        group_created_by:
          selectedGroup?.group_created_by || null,
      },

      groups: groupsResult.rows,
    });
  } catch (error) {
    console.error("Get assignment error:", error);

    return res.status(500).json({
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
      submission_type = "GROUP",
    } = req.body;

    const existing = await pool.query(
      `SELECT id
       FROM assignments
       WHERE id = $1 AND created_by = $2`,
      [assignmentId, adminId]
    );

    if (!["GROUP", "INDIVIDUAL"].includes(submission_type)) {
      return res.status(400).json({
        success: false,
        message: "submission_type must be GROUP or INDIVIDUAL",
     });
    }

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
       onedrive_link = $4,
       submission_type = $5
   WHERE id = $6
   RETURNING
     id,
     title,
     description,
     due_date,
     onedrive_link,
     submission_type,
     created_by,
     created_at`,
  [
    title.trim(),
    description?.trim() || null,
    due_date,
    onedrive_link.trim(),
    submission_type,
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