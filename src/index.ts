import express from "express";
import { Server } from "socket.io";
import cors from "cors"; // Import cors
import http from "http";
import signatureForCS from "./signatureForCS.js";
import callLogRoutes from "./routes/callLogRoutes.js";
import pool from "./db.js";
import languagesRoutes from "./routes/languagesRoutes.js";
import userRoutes from "./routes/userRouter.js";
import companyRoutes from "./routes/companyRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import setupSocket from "./socket.js";

// Test the database connection
pool.connect((err: any) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Connected to the PostgreSQL database");
  }
});

const port = process.env.PORT || 4000;

const app = express();
app.use(express.json(), cors());
app.options("*", cors());

// Use CORS middleware to enable cross-origin requests
app.use(
  cors({
    origin: process.env.ZOOM_FRONTEND_URL, // Replace with your frontend's origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // If cookies or authentication headers are needed
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ZOOM_FRONTEND_URL, // Allow requests from this origin
    methods: ["GET", "POST"], // Specify allowed methods
    credentials: true, // Allow cookies or authentication headers
  },
});

setupSocket(io);

app.use("/zoomForCS", signatureForCS);
app.use("/company", companyRoutes);
app.use("/stores", storeRoutes);
app.use("/languages", languagesRoutes);
app.use("/user", userRoutes);
app.use("/callLog", callLogRoutes);

// Start the server
server.listen(port, () => {
  // // // // console.log(`Server listening on port ${port}`);
});
