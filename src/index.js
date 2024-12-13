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

app.use("/company", companyRoutes);

app.use("/stores", storeRoutes);

// app.post("/stores", async (req, res) => {
//   const {
//     company_no,
//     store_name,
//     store_name_furigana,
//     zip,
//     pref,
//     city,
//     street,
//     building_name,
//     tel,
//     fax,
//     store_note,
//   } = req.body;

//   console.log(1113, req.body);

//   try {
//     // Insert the new store without passing store_no (it will be auto-generated by the trigger)
//     const result = await pool.query(
//       `INSERT INTO store_info (
//         company_no, store_name, store_name_furigana, zip, pref, city, street, building_name, tel, fax, store_note, created_at, updated_at, store_delete
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false) RETURNING *`,
//       [
//         company_no,
//         store_name,
//         store_name_furigana,
//         zip,
//         pref,
//         city,
//         street,
//         building_name,
//         tel,
//         fax,
//         store_note,
//       ]
//     );

//     // Return the inserted store
//     res.json(result.rows[0]);
//   } catch (err) {
//     // Handle unique constraint violation (store_no already exists for this company)
//     if (err.code === "23505") {
//       return res.status(400).json({
//         message: "Store number must be unique for each company",
//       });
//     }

//     // Handle other errors
//     console.error(err);
//     res.status(500).send("Server error");
//   }
// });

// app.get("/stores", async (req, res) => {
//   try {
//     // Query to retrieve all stores, excluding soft deleted ones (store_delete = false)
//     const result = await pool.query(
//       "SELECT * FROM store_info ORDER BY store_no"
//     );

//     // If no stores are found, return an empty array
//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "No stores found",
//       });
//     }

//     // Return the list of stores
//     res.json(result.rows);
//   } catch (err) {
//     // Handle any errors that occur during the query
//     console.error(err);
//     res.status(500).send("Server error");
//   }
// });

// app.get("/stores/:store_no", async (req, res) => {
//   const { store_no } = req.params; // Get the store_no from the URL parameter

//   try {
//     // Query to retrieve the store by its unique store_no
//     const result = await pool.query(
//       "SELECT * FROM store_info WHERE store_no = $1 AND store_delete = false",
//       [store_no]
//     );

//     // If the store is not found, return a 404 response
//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "Store not found",
//       });
//     }

//     // Return the store data
//     res.json(result.rows[0]);
//   } catch (err) {
//     // Handle any errors that occur during the query
//     console.error(err);
//     res.status(500).send("Server error");
//   }
// });

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
