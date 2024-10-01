import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'; // Add this import
import { KJUR } from 'jsrsasign'
import { inNumberArray, isBetween, isRequiredAllOrNone, validateRequest } from './validations.js'

let db = [
  {
    "userId": "user123",
    "languages": ["English"],
    "status": "available",
    "meetingNumber": "7193586721",
    "password": "B0h6vX"
  },
  {
    "userId": "user456",
    "languages": ["English", "Portuguese", "French"],
    "status": "busy",
    "meetingNumber": "23456789014",
    "password": "pass5678"
  },
  {
    "userId": "user789",
    "languages": ["Vietnamese"],
    "status": "available",
    "meetingNumber": "345678345678",
    "password": "345678"
  }
]

dotenv.config()
const app = express()
const port = process.env.PORT || 4000

// Use helmet for security headers
app.use(helmet());  // This automatically includes the necessary security headers

// Explicitly set security headers
app.use((req, res, next) => {
  // Strict-Transport-Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Content-Security-Policy (Example: allow scripts from self and trusted sources)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://trusted-scripts.com"
  );

  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'no-referrer');

  next();
});

app.use(express.json(), cors());
app.options('*', cors());

const propValidations = {
  role: inNumberArray([0, 1]),
  expirationSeconds: isBetween(1800, 172800)
}

const schemaValidations = [isRequiredAllOrNone(['meetingNumber', 'role'])]

const coerceRequestBody = (body) => ({
  ...body,
  ...['role', 'expirationSeconds'].reduce(
    (acc, cur) => ({ ...acc, [cur]: typeof body[cur] === 'string' ? parseInt(body[cur]) : body[cur] }),
    {}
  )
})

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/', (req, res) => {
  const requestBody = coerceRequestBody(req.body)
  const validationErrors = validateRequest(requestBody, propValidations, schemaValidations)

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors })
  }

  const { meetingNumber, role, expirationSeconds } = requestBody
  const iat = Math.floor(Date.now() / 1000)
  const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2
  const oHeader = { alg: 'HS256', typ: 'JWT' }

  const oPayload = {
    appKey: process.env.ZOOM_MEETING_SDK_KEY,
    sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp: exp
  }

  const sHeader = JSON.stringify(oHeader)
  const sPayload = JSON.stringify(oPayload)
  const sdkJWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, process.env.ZOOM_MEETING_SDK_SECRET)
  return res.json({ signature: sdkJWT, data:db })
})

// Route to get the db data
app.get('/api/users', (req, res) => {
  res.json(db);
});

app.listen(port, () => console.log(`Zoom Meeting SDK Auth Endpoint Sample Node.js, listening on port ${port}!`))
