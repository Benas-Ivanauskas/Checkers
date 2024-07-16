require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "checkers",
  password: process.env.PASSWORD,
  port: 5432,
});

module.exports = pool;
