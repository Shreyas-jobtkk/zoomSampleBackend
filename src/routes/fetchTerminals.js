import pool from '../db.js'; // Import the database connection

const getTableDetails = async () => {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT * FROM terminals'); // Replace with your actual query
        // console.log(res.rows);
        client.release(); // Release the client back to the pool
        return res.rows
    } catch (err) {
        console.error(err);
    }
};

export { getTableDetails };