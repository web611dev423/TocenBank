import pkg from 'pg';
const { Client } = pkg;

async function setupDatabase() {
  const client = new Client({
    user: "postgres",
    password: "root",
    host: "localhost",
    port: 5432,
  })

  try {
    await client.connect()
    console.log("Connected to PostgreSQL server")

    // Check if database exists
    const checkDbResult = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = 'auth_system'
    `)

    // Create database if it doesn't exist
    if (checkDbResult.rows.length === 0) {
      console.log("Creating auth_system database...")
      await client.query("CREATE DATABASE auth_system")
      console.log("Database created successfully")
    } else {
      console.log("Database auth_system already exists")
    }

    await client.end()
    console.log("Database setup completed")
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  }
}

setupDatabase()

