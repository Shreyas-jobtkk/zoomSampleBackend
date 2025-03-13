import express from "express";
import {
  inNumberArray,
  isBetween,
  isRequiredAllOrNone,
  validateRequest,
} from "./validations.js"; // Adjust the import as needed
import KJUR from "jsrsasign"; // Assuming you are using this for JWT signing

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

// POST route
router.post("/", (req, res) => {
  const requestBody = coerceRequestBody(req.body);
  const validationErrors = validateRequest(
    requestBody,
    propValidations,
    schemaValidations
  );

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const { meetingNumber, role, SDKAccount, expirationSeconds } = requestBody;
  const iat = Math.floor(Date.now() / 1000);
  const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2;
  const oHeader = { alg: "HS256", typ: "JWT" };

  // const getZoomSDKKey = (index) => {
  //   return process.env[`ZOOM_MEETING_SDK_KEY_${index}`];
  // };

  // const getZoomSDKSecret = (index) => {
  //   return process.env[`ZOOM_MEETING_SDK_SECRET_${index}`];
  // };

  // const ZOOM_MEETING_SDK_KEY = getZoomSDKKey(Number(SDKAccount));
  // const ZOOM_MEETING_SDK_SECRET = getZoomSDKSecret(Number(SDKAccount));

  // // console.log(2557, ZOOM_MEETING_SDK_KEY?.slice(0, 5));

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

  return res.json({ signature: sdkJWT });
});

// Export the router
export default router;
