import express from "express";
import { Server } from "socket.io";
import cors from "cors"; // Import cors
import http from "http";
import { handleWebSocket } from "./handleWebSocket.js";
import signature from "./signature.js";
import pool from "./db.js";
import languagesRoutes from "./routes/languagesRoutes.js";
import userRoutes from "./routes/userRouter.js";
import companyRoutes from "./routes/companyRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";

// Test the database connection
pool.connect((err: any) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    // console.log("Connected to the PostgreSQL database");
  }
});

// getUserDetails();
const port = process.env.PORT || 4000;

const app = express();
app.use(express.json(), cors());
app.options("*", cors());

app.use("/", signature);

// app.post("/api/terminalActivity", async (req, res) => {
//   const { terminal_id, personStatus } = req.body;
//   res.json({
//     message: "Data received successfully",
//     data: { terminal_id, personStatus },
//   });
//   updateUserStatus(terminal_id, personStatus);
// });

app.use("/company", companyRoutes);
app.use("/stores", storeRoutes);
app.use("/languages", languagesRoutes);
app.use("/user", userRoutes);

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
    origin: "http://localhost:4000", // Replace with your frontend's origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // If cookies or authentication headers are needed
  })
);

// app.options('*', cors());

handleWebSocket();

export { app, io };

// Start the server
server.listen(port, () => {
  // // console.log(`Server listening on port ${port}`);
});
