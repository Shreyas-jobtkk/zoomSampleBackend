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
import companyRoutes from "./routes/companyRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import languagesRoutes from "./routes/languagesRoutes.js";

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
// app.post("/company", async (req, res) => {
//   const { company_name, company_name_furigana, note } = req.body;

//   try {
//     // Insert company info with +9 hours to the current timestamp and default 'deleted' as false
//     const result = await pool.query(
//       `INSERT INTO company_info (company_name, company_name_furigana, company_note, created_at, updated_at, company_deleted)
//       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false)`,
//       [company_name, company_name_furigana, note]
//     );
//     console.log("Company added successfully");
//     res.status(201).json({ message: "Company added successfully" });
//   } catch (error) {
//     console.error("Error inserting company:", error);
//     res.status(500).json({ error: "Failed to insert company." });
//   }
// });

// app.get("/company/names", async (req, res) => {
//   console.log(122);
//   try {
//     const result = await pool.query(
//       "SELECT company_no, company_name FROM company_info"
//     );
//     res.status(200).json(result.rows); // Send response with company data
//   } catch (error) {
//     console.error("Error fetching company name details:", error);
//     res.status(500).json({ message: "Failed to fetch company name details." });
//   }
// });

// console.log(1474, companyRoutes);

app.use("/company", companyRoutes);

app.use("/stores", storeRoutes);

app.use("/languages", languagesRoutes);

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
