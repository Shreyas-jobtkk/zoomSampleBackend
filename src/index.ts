import express from "express";
import { Server } from "socket.io";
import cors from "cors"; // Import cors
import http from "http";
// import { handleWebSocket } from "./handleWebSocket.js";
import { startZoomMeeting } from "./signature.js";
import signatureForCS from "./signatureForCS.js";
import callLogRoutes from "./routes/callLogRoutes.js";
import signature from "./signature.js";
import pool from "./db.js";
import languagesRoutes from "./routes/languagesRoutes.js";
import userRoutes from "./routes/userRouter.js";
import companyRoutes from "./routes/companyRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import createMeeting from "./routes/zoomRoutes.js";
import { store, setMeetingData, resetMeetingData } from "./store";
import * as userModel from "../src/models/userModel";
// import { createMeeting } from "./createMeeting.js";

// Test the database connection
pool.connect((err: any) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    // // console.log("Connected to the PostgreSQL database");
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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ZOOM_FRONTEND_URL, // Allow requests from this origin
    methods: ["GET", "POST"], // Specify allowed methods
    credentials: true, // Allow cookies or authentication headers
  },
});

const getAllInterpretersLanguagesId = async () => {
  try {
    const interpreters = await userModel.getAllInterpretersLanguagesId();
    return interpreters;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

let reqUsers: any = [];

io.on("connection", (socket) => {
  // // // console.log('a user connected');

  socket.on("callRequest", async (data) => {
    // // console.log(1557, data);

    reqUsers.push(data);
    // console.log(107, reqUsers);

    while (reqUsers.length > 0) {
      // // console.log(108, reqUsers[0].languageSupportNo);
      // // console.log(1110, reqUsers);

      // for (let i = 0; i < reqUsers.length; i++) {
      //   const processLanguageNo = reqUsers[i].languageSupportNo;
      //   const interpreters = await getAllInterpretersLanguagesId();
      //   const uniqueLanguages = [
      //     ...new Set(
      //       interpreters.flatMap((item: any) => item.translate_languages)
      //     ),
      //   ];

      //   // // console.log(110, uniqueLanguages);
      //   if (uniqueLanguages.includes(processLanguageNo)) {
      //     // // console.log(109, interpreters);

      //     const availableInterpreters = interpreters.filter((interpreter) =>
      //       interpreter.translate_languages.some(
      //         (lang) => lang === processLanguageNo
      //       )
      //     );

      //     // // console.log(45, reqUsers[i]);
      //     // // console.log(158, availableInterpreters[0]);
      //     // // console.log(245, await startZoomMeeting(reqUsers[i]));

      //     const meetingJoinData = {
      //       contractorNo: reqUsers[i].contractorNo,
      //       signature: await startZoomMeeting({
      //         meetingNumber: reqUsers[i].meetingNumber,
      //         role: 0,
      //       }),
      //     };

      //     const meetingHostData = {
      //       interpreterNo: availableInterpreters[0].user_no,
      //       signature: await startZoomMeeting({
      //         meetingNumber: reqUsers[i].meetingNumber,
      //         role: 1,
      //       }),
      //     };

      //     // // console.log("beforeMatch", reqUsers);

      //     reqUsers = reqUsers.filter(
      //       (item: any) => item.contractorNo !== reqUsers[i].contractorNo
      //     );

      //     await userModel.updateInterpretersStatus(
      //       String(availableInterpreters[0].user_no),
      //       "inactive"
      //     );

      //     // // console.log("afterMatch", reqUsers);

      //     io.emit("meetingJoinData", meetingJoinData);
      //     io.emit("meetingHostData", meetingHostData);
      //   }
      // }

      for (const user of [...reqUsers]) {
        // // console.log(189, user.contractorNo);
        // Clone the array to avoid mutation issues
        const processLanguageNo = user.languageSupportNo;
        const interpreters = await getAllInterpretersLanguagesId();

        const uniqueLanguages = [
          ...new Set(
            interpreters.flatMap((item: any) => item.translate_languages)
          ),
        ].map(String); // Ensure consistent type

        if (!uniqueLanguages.includes(String(processLanguageNo))) continue;

        const availableInterpreters = interpreters.filter((interpreter) =>
          interpreter.translate_languages.includes(processLanguageNo)
        );

        if (availableInterpreters.length === 0) continue;

        console.log(489, user);

        const interpreter = availableInterpreters[0];

        const meetingHostSignature = await startZoomMeeting({
          meetingNumber: user.meetingNumber,
          role: 1,
        });

        // const [meetingJoinSignature, meetingHostSignature] = await Promise.all([
        //   startZoomMeeting({ meetingNumber: user.meetingNumber, role: 0 }),
        //   startZoomMeeting({ meetingNumber: user.meetingNumber, role: 1 }),
        // ]);

        const meetingHostData = {
          interpreterNo: interpreter.user_no,
          signature: meetingHostSignature,
          contractorNo: user.contractorNo,
          meetingNumber: user.meetingNumber,
        };

        // // console.log("before", reqUsers);

        reqUsers = reqUsers.filter(
          (item: any) => item.contractorNo !== user.contractorNo
        );

        // // console.log("after", reqUsers);

        // io.emit("meetingJoinData", meetingJoinData);
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
    // // console.log(589, data);

    const meetingJoinSignature = await startZoomMeeting({
      meetingNumber: data.meetingNumber,
      role: 0,
    });

    const meetingJoinData = {
      // interpreterNo: interpreter.user_no,
      signature: meetingJoinSignature,
      contractorNo: data.contractorNo,
      interpreterNumber: data.interpreterNumber,
      response: data.response,
    };
    io.emit("interpreterServerResponse", meetingJoinData);
  });

  socket.on("cancelCallRequest", async (data) => {
    console.log(1557, data);
    console.log(2557, reqUsers);

    const checkContractor = (arr: any, contractorNo: any) =>
      arr.some((item: any) => item.contractorNo === contractorNo);

    console.log(777, checkContractor(reqUsers, data.contractorNo)); // true

    if (checkContractor(reqUsers, data.contractorNo)) {
      reqUsers = reqUsers.filter(
        (item: any) => item.contractorNo !== data.contractorNo
      );
    } else {
      io.emit("cancelCallRequestFromServer", data);
    }

    console.log(3557, reqUsers);

    // console.log(208, reqUsers);
  });

  // function processArray(reqUsers: any) {
  //   // Base case: if array has 1 or fewer elements, return the array
  //   if (reqUsers.length < 1) {
  //     return;
  //   }

  //   // console.log(145, reqUsers.length);

  //   // Recursive call with the remaining array
  //   return processArray(reqUsers);
  // }

  // Set a timeout for the next element, 100ms later
  // setTimeout(() => {
  //   processArray(reqUsers);
  // }, 100);

  socket.on("meetingDetails", async (data) => {
    const { meetingNumber, password } = data;
    // console.log(155, data);
    // Dispatch the action to store the meeting details
    store.dispatch(setMeetingData({ meetingNumber, password }));
  });
});

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
  // console.log("Received from frontend:", meetingNumber, password);
  res.json({ success: true, message: "Meeting details received." });
});

app.use("/createMeeting", createMeeting);
app.use("/zoomForCS", signatureForCS);
app.use("/zoom", signature);
app.use("/company", companyRoutes);
app.use("/stores", storeRoutes);
app.use("/languages", languagesRoutes);
app.use("/user", userRoutes);
app.use("/callLog", callLogRoutes);

// Endpoint to get meeting data
app.get("/get-meeting-data", (req, res) => {
  // // console.log("Fetching meeting data:", store.getState().app.meetingData);
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

// handleWebSocket();

export { app, io };

// Start the server
server.listen(port, () => {
  // // // console.log(`Server listening on port ${port}`);
});
