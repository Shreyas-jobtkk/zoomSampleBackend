import express from "express";
import { Server } from "socket.io";
import cors from "cors"; // Import cors
import http from "http";
import { generateSignature } from "./signature.js";
import signatureForCS from "./signatureForCS.js";
import callLogRoutes from "./routes/callLogRoutes.js";
import pool from "./db.js";
import languagesRoutes from "./routes/languagesRoutes.js";
import userRoutes from "./routes/userRouter.js";
import companyRoutes from "./routes/companyRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import * as userModel from "../src/models/userModel";

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

// Array to store user call requests waiting for an interpreter
let reqUsers: any = [];

io.on("connection", (socket) => {
  // Listen for "zoomMessage" event and broadcast it
  socket.on("zoomMessage", async (data) => {
    io.emit("streamMessage", data);
  });

  // Listen for "zoomEmoji" event and broadcast it
  socket.on("zoomEmoji", async (data) => {
    io.emit("zoomStreamEmoji", data);
  });

  // Listen for "callRequest" event, process it, and find an available interpreter
  socket.on("callRequest", async (data) => {
    reqUsers.push(data);

    while (reqUsers.length > 0) {
      for (const user of [...reqUsers]) {
        const processLanguageNo = user.languageSupportNo;
        const interpreters =
          await userModel.getActiveAllInterpretersLanguagesId();

        // Get a unique list of all languages interpreters can translate
        const uniqueLanguages = [
          ...new Set(
            interpreters.flatMap((item: any) => item.translate_languages)
          ),
        ].map(String); // Ensure consistent type

        if (!uniqueLanguages.includes(String(processLanguageNo))) continue;

        // Find interpreters who support the requested language
        const availableInterpreters = interpreters.filter((interpreter) =>
          interpreter.translate_languages.includes(processLanguageNo)
        );

        if (availableInterpreters.length === 0) continue;

        const interpreter = availableInterpreters[0];

        const meetingHostSignature = await generateSignature({
          meetingNumber: user.meetingNumber,
          role: 1,
        });

        // Prepare data to send to the client
        const meetingHostData = {
          interpreterNo: interpreter.user_no,
          signature: meetingHostSignature,
          contractorNo: user.contractorNo,
          meetingNumber: user.meetingNumber,
        };

        // Remove processed user request from the queue
        reqUsers = reqUsers.filter(
          (item: any) => item.contractorNo !== user.contractorNo
        );

        io.emit("meetingHostData", meetingHostData);

        await userModel.updateInterpretersStatus(
          String(interpreter.user_no),
          "inactive"
        );
      }

      // Simulate delay if needed
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    io.emit("callRequestFromServer", data);
  });

  socket.on("interpreterResponse", async (data) => {
    // Generate a Zoom meeting join signature using the provided meeting number and role
    const meetingJoinSignature = await generateSignature({
      meetingNumber: data.meetingNumber,
      role: 0,
    });

    // Prepare the response object to send back to the client
    const meetingJoinData = {
      signature: meetingJoinSignature,
      contractorNo: data.contractorNo,
      interpreterNumber: data.interpreterNumber,
      response: data.response,
    };

    // Emit the response data to connected client
    io.emit("interpreterServerResponse", meetingJoinData);
  });

  socket.on("cancelCallRequest", async (data) => {
    // Helper function to check if a contractor exists in the reqUsers array
    const checkContractor = (arr: any, contractorNo: any) =>
      arr.some((item: any) => item.contractorNo === contractorNo);

    // Check if the contractor exists in the reqUsers list
    if (checkContractor(reqUsers, data.contractorNo)) {
      reqUsers = reqUsers.filter(
        (item: any) => item.contractorNo !== data.contractorNo
      );
    } else {
      // If the contractor does not exist, notify client about the cancellation
      io.emit("cancelCallRequestFromServer", data);
    }
  });
});

app.use("/zoomForCS", signatureForCS);
app.use("/company", companyRoutes);
app.use("/stores", storeRoutes);
app.use("/languages", languagesRoutes);
app.use("/user", userRoutes);
app.use("/callLog", callLogRoutes);

export { app, io };

// Start the server
server.listen(port, () => {
  // // // // console.log(`Server listening on port ${port}`);
});
