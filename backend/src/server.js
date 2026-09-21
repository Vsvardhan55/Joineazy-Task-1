const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// ROOT
// ==========================================
app.get("/", (req, res) => {
  res.json({
    message: "Joineazy Task 1 API is running",
  });
});

// ==========================================
// DATABASE HEALTH
// ==========================================
app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Neon PostgreSQL connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ==========================================
// AUTH ROUTES
// ==========================================
app.use("/api/auth", authRoutes);

// ==========================================
// GROUP ROUTES
// ==========================================
app.use("/api/groups", groupRoutes);

// ==========================================
// ASSIGNMENT ROUTES
// ==========================================
app.use("/api/assignments", assignmentRoutes);

// ==========================================
// SUBMISSION ROUTES
// ==========================================
app.use("/api/submissions", submissionRoutes);


// ==========================================
// SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;