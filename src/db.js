// db.js

import pg from 'pg'; // Import the entire pg module
const { Pool } = pg; // Destructure the Pool class from the pg module

// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'firstDB',
    password: 'postgre',
    port: 5432,
});

// Export the pool for use in other files
export default pool;
