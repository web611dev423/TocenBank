import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "auth_system",
})

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to the database", err.stack)
  } else {
    console.log("Database connected successfully")
  }
})

export default pool

