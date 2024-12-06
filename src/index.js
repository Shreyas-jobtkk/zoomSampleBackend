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
