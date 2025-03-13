import express from "express";
import {
  inNumberArray,
  isBetween,
  isRequiredAllOrNone,
  validateRequest,
} from "./validations.js"; // Adjust the import as needed
import KJUR from "jsrsasign"; // Assuming you are using this for JWT signing
import * as userModel from "../src/models/userModel";
// import { io } from "./index.js";

const router = express.Router();

// Prop validations
const propValidations = {
  role: inNumberArray([0, 1]),
  expirationSeconds: isBetween(1800, 172800),
};

// Schema validations
const schemaValidations = [isRequiredAllOrNone(["meetingNumber", "role"])];

// Coerce request body function
const coerceRequestBody = (body) => ({
  ...body,
  ...["role", "expirationSeconds"].reduce(
    (acc, cur) => ({
      ...acc,
      [cur]: typeof body[cur] === "string" ? parseInt(body[cur]) : body[cur],
    }),
    {}
  ),
});

const getAllInterpretersLanguagesId = async () => {
  try {
    const users = await userModel.getAllInterpretersLanguagesId();
    return users;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

// io.on("connection", (socket) => {
//   socket.on("callRequest", async (data) => {
//     // console.log(1557, data);

//     io.emit("callRequestFromServer", data);
//   });

//   socket.on("cancelCallRequest", async (data) => {
//     // console.log(2557, data);

//     io.emit("cancelCallRequestFromServer", data);
//   });
// });

// POST route
// router.post("/", async (req, res) => {
//   // Coerce the request body and validate it
//   const requestBody = coerceRequestBody(req.body);
//   const validationErrors = validateRequest(
//     requestBody,
//     propValidations,
//     schemaValidations
//   );

//   if (validationErrors.length > 0) {
//     return res.status(400).json({ errors: validationErrors });
//   }

//   const {
//     meetingNumber,
//     role,
//     contractorNo,
//     languageSupportNo,
//     expirationSeconds,
//   } = requestBody;

//   // console.log(1578, contractorNo, languageSupportNo);
//   const iat = Math.floor(Date.now() / 1000);
//   const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2;
//   const oHeader = { alg: "HS256", typ: "JWT" };
//   try {
//     // First, get the interpreters' data
//     const users = await getAllInterpretersLanguagesId();

//     const oPayload = {
//       appKey: process.env.ZOOM_MEETING_SDK_KEY,
//       sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
//       mn: meetingNumber,
//       role,
//       iat,
//       exp,
//       tokenExp: exp,
//     };

//     const sHeader = JSON.stringify(oHeader);
//     const sPayload = JSON.stringify(oPayload);
//     const sdkJWT = KJUR.jws.JWS.sign(
//       "HS256",
//       sHeader,
//       sPayload,
//       process.env.ZOOM_MEETING_SDK_SECRET
//     );

//     // Send the combined response with both the users and the signature
//     return res.status(200).json({ users, signature: sdkJWT });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: error.message });
//   }
// });

const startZoomMeeting = async (meetingInfo) => {
  // Coerce the request body and validate it
  const requestBody = coerceRequestBody(meetingInfo);
  const validationErrors = validateRequest(
    requestBody,
    propValidations,
    schemaValidations
  );

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const { meetingNumber, role, expirationSeconds } = requestBody;

  // // console.log(1578, contractorNo, languageSupportNo);
  const iat = Math.floor(Date.now() / 1000);
  const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2;
  const oHeader = { alg: "HS256", typ: "JWT" };
  try {
    // First, get the interpreters' data
    // const users = await getAllInterpretersLanguagesId();

    const oPayload = {
      appKey: process.env.ZOOM_MEETING_SDK_KEY,
      sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
      mn: meetingNumber,
      role,
      iat,
      exp,
      tokenExp: exp,
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const sdkJWT = KJUR.jws.JWS.sign(
      "HS256",
      sHeader,
      sPayload,
      process.env.ZOOM_MEETING_SDK_SECRET
    );

    // Send the combined response with both the users and the signature
    return { signature: sdkJWT };
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Export the router
export default router;
export { startZoomMeeting };
