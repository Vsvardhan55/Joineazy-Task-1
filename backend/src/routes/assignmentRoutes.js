const express = require("express");

const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  assignToGroups,
} = require("../controllers/assignmentController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

// View assignments - students and admins
router.get("/", authorize("STUDENT", "ADMIN"), getAssignments);

router.get("/:id", authorize("STUDENT", "ADMIN"), getAssignmentById);

// Admin-only management
router.post("/", authorize("ADMIN"), createAssignment);

router.put("/:id", authorize("ADMIN"), updateAssignment);

router.delete("/:id", authorize("ADMIN"), deleteAssignment);

router.post(
  "/:id/groups",
  authorize("ADMIN"),
  assignToGroups
);

module.exports = router;