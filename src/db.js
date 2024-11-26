// db.js

import pg from "pg"; // Import the entire pg module
const { Pool } = pg; // Destructure the Pool class from the pg module
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  // connectionString: DATABASE_URL,
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Set to true if you need strict SSL verification
  },
});

export default pool;
