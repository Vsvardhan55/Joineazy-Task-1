const express = require("express");

const {
  getMySubmission,
  confirmSubmission,
  getGroupProgress,
  getAdminSubmissionTracking,
} = require("../controllers/submissionController");

const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get(
  "/admin/tracking",
  authorize("ADMIN"),
  getAdminSubmissionTracking
);

router.get(
  "/group/:groupId/progress",
  authorize("STUDENT"),
  getGroupProgress
);

router.get(
  "/:assignmentId",
  authorize("STUDENT"),
  getMySubmission
);

router.post(
  "/:assignmentId/confirm",
  authorize("STUDENT"),
  confirmSubmission
);

module.exports = router;