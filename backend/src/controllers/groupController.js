const pool = require("../config/db");

// ==========================================
// CREATE GROUP
// ==========================================
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    // Create group
    const groupResult = await pool.query(
      `INSERT INTO groups (name, created_by)
       VALUES ($1, $2)
       RETURNING id, name, created_by, created_at`,
      [name.trim(), userId]
    );

    const group = groupResult.rows[0];

    // Automatically add creator as first member
    await pool.query(
      `INSERT INTO group_members (group_id, student_id)
       VALUES ($1, $2)`,
      [group.id, userId]
    );

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Create group error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating group",
    });
  }
};

// ==========================================
// GET MY GROUPS
// ==========================================
const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
          g.id,
          g.name,
          g.created_by,
          g.created_at,
          COUNT(gm.student_id)::INTEGER AS member_count
       FROM groups g
       INNER JOIN group_members gm
          ON g.id = gm.group_id
       WHERE g.id IN (
          SELECT group_id
          FROM group_members
          WHERE student_id = $1
       )
       GROUP BY g.id
       ORDER BY g.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      groups: result.rows,
    });
  } catch (error) {
    console.error("Get groups error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching groups",
    });
  }
};

// ==========================================
// GET GROUP DETAILS
// ==========================================
const getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    // Check whether the current student belongs to this group
    const accessResult = await pool.query(
      `
      SELECT g.id, g.name, g.created_by, g.created_at
      FROM groups g
      INNER JOIN group_members gm
        ON g.id = gm.group_id
      WHERE g.id = $1
        AND gm.student_id = $2
      `,
      [groupId, userId]
    );

    if (accessResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const group = accessResult.rows[0];

    // Get all members of the group
    const membersResult = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.student_id,
        gm.joined_at
      FROM group_members gm
      INNER JOIN users u
        ON gm.student_id = u.id
      WHERE gm.group_id = $1
      ORDER BY gm.joined_at ASC
      `,
      [groupId]
    );

    group.members = membersResult.rows;

    return res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    console.error("Get group by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get group details",
    });
  }
};

// ==========================================
// ADD MEMBER
// ==========================================
const addMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { email, student_id } = req.body;
    const currentUserId = req.user.id;

    if (!email && !student_id) {
      return res.status(400).json({
        success: false,
        message: "Provide student email or student ID",
      });
    }

    // Check group
    const groupResult = await pool.query(
      `SELECT id, created_by
       FROM groups
       WHERE id = $1`,
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    const group = groupResult.rows[0];

    // Only group creator can add members
    if (group.created_by !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Only the group creator can add members",
      });
    }

    // Find student
    let userQuery;
    let queryValue;

    if (email) {
      userQuery = `
        SELECT id, name, email, student_id, role
        FROM users
        WHERE LOWER(email) = LOWER($1)
          AND role = 'STUDENT'
      `;
      queryValue = email;
    } else {
      userQuery = `
        SELECT id, name, email, student_id, role
        FROM users
        WHERE student_id = $1
          AND role = 'STUDENT'
      `;
      queryValue = student_id;
    }

    const studentResult = await pool.query(
      userQuery,
      [queryValue]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const student = studentResult.rows[0];

    // Check existing membership
    const existingMember = await pool.query(
      `SELECT 1
       FROM group_members
       WHERE group_id = $1
         AND student_id = $2`,
      [groupId, student.id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Student is already a member of this group",
      });
    }

    // Add member
    await pool.query(
      `INSERT INTO group_members (group_id, student_id)
       VALUES ($1, $2)`,
      [groupId, student.id]
    );

    res.status(201).json({
      success: true,
      message: "Student added to group successfully",
      member: student,
    });
  } catch (error) {
    console.error("Add member error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while adding member",
    });
  }
};

// ==========================================
// REMOVE MEMBER
// ==========================================
const removeMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const studentId = req.params.studentId;
    const currentUserId = req.user.id;

    const groupResult = await pool.query(
      `SELECT created_by
       FROM groups
       WHERE id = $1`,
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (groupResult.rows[0].created_by !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Only the group creator can remove members",
      });
    }

    // Don't allow creator to remove themselves
    if (Number(studentId) === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Group creator cannot remove themselves",
      });
    }

    const result = await pool.query(
      `DELETE FROM group_members
       WHERE group_id = $1
         AND student_id = $2
       RETURNING id`,
      [groupId, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student is not a member of this group",
      });
    }

    res.json({
      success: true,
      message: "Student removed from group successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while removing member",
    });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        g.id,
        g.name,
        g.created_by,
        u.name AS creator_name,
        COUNT(gm.student_id)::INTEGER AS member_count
      FROM groups g
      INNER JOIN users u
        ON g.created_by = u.id
      LEFT JOIN group_members gm
        ON g.id = gm.group_id
      GROUP BY
        g.id,
        g.name,
        g.created_by,
        u.name
      ORDER BY g.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      groups: result.rows,
    });
  } catch (error) {
    console.error("Get all groups error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get groups",
    });
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
  removeMember,
  getAllGroups,
};