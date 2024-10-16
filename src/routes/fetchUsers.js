import pool from '../db.js'; // Import the database connection

const getUserDetails = async () => {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT * FROM institution'); // Replace with your actual query
        console.log(445,res.rows);
        client.release(); // Release the client back to the pool
        return res.rows
    } catch (err) {
        console.error(err);
    }
};

export { getUserDetails };