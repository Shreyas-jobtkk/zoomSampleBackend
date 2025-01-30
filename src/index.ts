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
import createMeeting from "./routes/zoomRoutes.js";
import { store, setMeetingData, resetMeetingData } from "./store";
// import { createMeeting } from "./createMeeting.js";

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

// Use CORS middleware to enable cross-origin requests
app.use(
  cors({
    origin: process.env.ZOOM_FRONTEND_URL, // Replace with your frontend's origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // If cookies or authentication headers are needed
  })
);

// // Middleware to set security headers
// app.use((req, res, next) => {
//   res.setHeader(
//     "Strict-Transport-Security",
//     "max-age=31536000; includeSubDomains; preload"
//   );
//   res.setHeader("X-Content-Type-Options", "nosniff");
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src 'self'; script-src 'self';"
//   );
//   res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
//   next();
// });

// app.post("/api/terminalActivity", async (req, res) => {
//   const { terminal_id, personStatus } = req.body;
//   res.json({
//     message: "Data received successfully",
//     data: { terminal_id, personStatus },
//   });
//   updateUserStatus(terminal_id, personStatus);
// });
// createMeeting();

app.post("/reqMeeting", (req, res) => {
  const { meetingNumber, password } = req.body;
  console.log("Received from frontend:", meetingNumber, password);
  res.json({ success: true, message: "Meeting details received." });
});

app.use("/createMeeting", createMeeting);
app.use("/zoom", signature);
app.use("/company", companyRoutes);
app.use("/stores", storeRoutes);
app.use("/languages", languagesRoutes);
app.use("/user", userRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ZOOM_FRONTEND_URL, // Allow requests from this origin
    methods: ["GET", "POST"], // Specify allowed methods
    credentials: true, // Allow cookies or authentication headers
  },
});

io.on("connection", (socket) => {
  // // console.log('a user connected');

  socket.on("meetingDetails", async (data) => {
    const { meetingNumber, password } = data;

    if (meetingNumber && password) {
      // Dispatch the action to store the meeting details
      store.dispatch(setMeetingData({ meetingNumber, password }));

      // Log the updated state after dispatching
      // console.log("Updated state:", store.getState().app.meetingData);
    } else {
      console.log("Invalid data received for meetingDetails:", data);
    }
  });
});

// Endpoint to get meeting data
app.get("/get-meeting-data", (req, res) => {
  // console.log("Fetching meeting data:", store.getState().app.meetingData);
  res.json(store.getState().app.meetingData);
});

// Endpoint to initialize meeting data
// app.post("/set-meeting-data", (req, res) => {
// const { meetingNumber, password } = req.body;

// if (meetingNumber && password) {
//   store.dispatch(setMeetingData({ meetingNumber, password }));
//   res.json({ message: "Meeting data initialized", state: store.getState() });
// } else {
//   res.status(400).json({ message: "Invalid data" });
// }
// });

// app.options('*', cors());

handleWebSocket();

export { app, io };

// Start the server
server.listen(port, () => {
  // // console.log(`Server listening on port ${port}`);
});
