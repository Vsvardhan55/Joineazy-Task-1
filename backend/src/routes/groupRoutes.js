const express = require("express");

const {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
  removeMember,
  getAllGroups,
} = require("../controllers/groupController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All group APIs require authentication
router.use(authenticate);

router.post(
  "/",
  authorize("STUDENT"),
  createGroup
);

router.get(
  "/",
  authorize("STUDENT"),
  getMyGroups
);

router.get(
  "/all",
  authorize("ADMIN"),
  getAllGroups
);

router.get(
  "/:id",
  authorize("STUDENT"),
  getGroupById
);

router.post(
  "/:id/members",
  authorize("STUDENT"),
  addMember
);

router.delete(
  "/:id/members/:studentId",
  authorize("STUDENT"),
  removeMember
);

module.exports = router;