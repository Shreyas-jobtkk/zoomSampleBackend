import pool from '../db.js'; // Import the database connection


const updateUserStatus = async (userId, newStatus) => {
    // console.log(144,userId, newStatus)
    try {
        // Acquire a client from the pool
        const client = await pool.connect();

        // Execute the query to update the user's status in the database
        const result = await client.query(
            'UPDATE terminals SET status = $1 WHERE terminal_id = $2 RETURNING *', // Parameterized query
            [newStatus, userId] // Parameters to prevent SQL injection
        );

        // Check if the user was found and updated
        if (result.rowCount === 0) {
            console.log(`User with ID ${userId} not found.`); // Log if no user was found
        } else {
            // console.log(`User status updated successfully:`, result.rows[0]); // Log the updated user details
        }

        // Release the client back to the pool
        client.release();
    } catch (err) {
        // Log any errors that occur during the query execution
        console.error('Error updating user status:', err);
    }
};

export { updateUserStatus };