const { Pool } = require("pg");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../../.env"),
});

const databaseUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
  host: "3.23.186.13",
  port: 5432,
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.slice(1),

  ssl: {
    rejectUnauthorized: false,
    servername: databaseUrl.hostname,
  },

  options: `endpoint=${databaseUrl.hostname.split(".")[0]}`,
});

pool.on("connect", () => {
  console.log("Connected to Neon PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});

module.exports = pool;