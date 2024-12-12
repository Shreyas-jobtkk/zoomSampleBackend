import express from "express";
import { Server } from "socket.io";
import cors from "cors"; // Import cors
import { getTerminalDetails } from "./routes/fetchTerminals.js";
import { getUserDetails } from "./routes/fetchUsers.js";
import { updateUserStatus } from "./routes/updateTerminal.js";
import http from "http";
import { handleWebSocket } from "./handleWebSocket.js";
import signature from "./signature.js";
import pool from "./db.js";
// import {  server, io } from './routes/handleSocket.js';

// Test the database connection
pool.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Connected to the PostgreSQL database");
  }
});

// getUserDetails();
const port = process.env.PORT || 4000;

const app = express();
app.use(express.json(), cors());
app.options("*", cors());

app.use("/", signature);

app.post("/api/terminalActivity", async (req, res) => {
  const { terminal_id, personStatus } = req.body;
  // // console.log('Received:', req.body);
  // // console.log(122);

  // Respond with a success message
  res.json({
    message: "Data received successfully",
    data: { terminal_id, personStatus },
  });
  updateUserStatus(terminal_id, personStatus);
});

app.get("/api/terminals", async (req, res) => {
  // // console.log(157)
  try {
    const users = await getTerminalDetails(); // Await inside an async function
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.get("/api/users", async (req, res) => {
  // // console.log(257)
  try {
    const users = await getUserDetails(); // Await inside an async function
    res.json(users);
    // // console.log(255)
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Handling POST request to insert company data
app.post("/company", async (req, res) => {
  const { company_name, company_name_furigana, note } = req.body;

  try {
    // Insert company info with +9 hours to the current timestamp and default 'deleted' as false
    const result = await pool.query(
      `INSERT INTO company_info (company_name, company_name_furigana, company_note, created_at, updated_at, company_deleted) 
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false)`,
      [company_name, company_name_furigana, note]
    );
    console.log("Company added successfully");
    res.status(201).json({ message: "Company added successfully" });
  } catch (error) {
    console.error("Error inserting company:", error);
    res.status(500).json({ error: "Failed to insert company." });
  }
});

// Handling GET request to fetch all companies
app.get("/company", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM company_info");
    res.status(200).json(result.rows);
    console.log(146, result.rows);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Failed to fetch companies." });
  }
});

// Get a single company
app.get("/company/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM company_info WHERE company_no = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Failed to fetch company." });
  }
});

// Update a company
app.put("/company/:id", async (req, res) => {
  const { id } = req.params;
  const { company_name, company_name_furigana, company_note } = req.body;

  console.log(155, req.body);

  try {
    const result = await pool.query(
      "UPDATE company_info SET company_name = $1, company_name_furigana = $2, company_note = $3, updated_at = CURRENT_TIMESTAMP WHERE company_no = $4 RETURNING *",
      [company_name, company_name_furigana, company_note, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ error: "Failed to update company." });
  }
});

// Delete a company
app.delete("/company", async (req, res) => {
  const { ids } = req.body; // Expect an array of IDs in the request body

  console.log(144);

  try {
    const result = await pool.query(
      "UPDATE company_info SET company_deleted = true WHERE company_no = ANY($1::int[]) RETURNING *",
      [ids]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No companies found to delete." });
    }

    res.status(200).json({
      message: "Companies deleted successfully.",
      deleted: result.rows,
    });
  } catch (error) {
    console.error("Error deleting companies:", error);
    res.status(500).json({ error: "Failed to delete companies." });
  }
});

app.post("/stores", async (req, res) => {
  console.log(1113);
  const {
    company_no,
    store_name,
    store_name_furigana,
    zip,
    pref,
    city,
    street,
    building_name,
    tel,
    fax,
    store_note,
  } = req.body;

  try {
    // Insert the new store without passing store_no (it will be auto-generated by the trigger)
    const result = await pool.query(
      `INSERT INTO store_info (
        company_no, store_name, store_name_furigana, zip, pref, city, street, building_name, tel, fax, store_note, created_at, updated_at, store_delete
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false) RETURNING *`,
      [
        company_no,
        store_name,
        store_name_furigana,
        zip,
        pref,
        city,
        street,
        building_name,
        tel,
        fax,
        store_note,
      ]
    );

    // Return the inserted store
    res.json(result.rows[0]);
  } catch (err) {
    // Handle unique constraint violation (store_no already exists for this company)
    if (err.code === "23505") {
      return res.status(400).json({
        message: "Store number must be unique for each company",
      });
    }

    // Handle other errors
    console.error(err);
    res.status(500).send("Server error");
  }
});

// // console.log(145)

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Allow requests from this origin
    methods: ["GET", "POST"], // Specify allowed methods
    credentials: true, // Allow cookies or authentication headers
  },
});

// Use CORS middleware to enable cross-origin requests
app.use(
  cors({
    origin: true, // Your frontend's origin
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// app.options('*', cors());

handleWebSocket();

export { app, io };

// Start the server
server.listen(port, () => {
  // console.log(`Server listening on port ${port}`);
});
