const { Pool } = require("pg");

const pool = new Pool({
  user: "africk",          // 🔹 change if different
  host: "localhost",
  database: "my_ndis_db",    // 🔹 your DB name
  password: "postgres",  // 🔹 set your DB password
  port: 5432,
});

module.exports = pool;
