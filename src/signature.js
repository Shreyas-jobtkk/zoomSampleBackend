import express from "express";
import {
  inNumberArray,
  isBetween,
  isRequiredAllOrNone,
  validateRequest,
} from "./validations.js"; // Adjust the import as needed
import KJUR from "jsrsasign"; // Assuming you are using this for JWT signing
import * as userModel from "../src/models/userModel";

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

const generateSignature = async (meetingInfo) => {
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
  const iat = Math.floor(Date.now() / 1000);
  const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2;
  const oHeader = { alg: "HS256", typ: "JWT" };
  try {
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

export { generateSignature };
