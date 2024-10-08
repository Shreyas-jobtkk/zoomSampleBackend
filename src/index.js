import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';  // Import cors
import { KJUR } from 'jsrsasign'
import { inNumberArray, isBetween, isRequiredAllOrNone, validateRequest } from './validations.js'
import dotenv from 'dotenv'
import axios from 'axios';
import helmet from 'helmet';
import fetch from 'node-fetch';

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

dotenv.config(); 
const port = process.env.PORT || 4000;

const app = express();
app.use(express.json(), cors())
app.options('*', cors())
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Allow requests from this origin
    // origin: 'https://zoomfrontendapp.netlify.app', // Allow requests from this origin
    methods: ['GET', 'POST'], // Specify allowed methods
    credentials: true, // Allow cookies or authentication headers
  },
});

// Use CORS middleware to enable cross-origin requests
app.use(cors({
  // origin: 'https://zoomfrontendapp.netlify.app', // Your frontend's origin
  origin: true,// Your frontend's origin
  methods: ['GET', 'POST'],
  credentials: true,
}));


// app.use((req, res, next) => {
//     res.append('X-Content-Type-Options', "nosniff");
//     res.append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
//     res.append("Referrer-Policy", "no-referrer");
//     res.append("Content-Security-Policy", "default-src * data: blob: 'self'  wss: ws: localhost:; script-src https:* 127.0.0.1:* *.spotilocal.com:* 'unsafe-inline' 'unsafe-eval' blob: data: 'self'; style-src data: blob: 'unsafe-inline' 'self'");
//     next();
// });

// app.use('/', express.static('public/dist'))



app.use(helmet());

// Customizing Content-Security-Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on your app's needs
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// Referrer-Policy (no-referrer-when-downgrade is a common policy)
app.use(helmet.referrerPolicy({ policy: 'no-referrer-when-downgrade' }));

const corsOptions = {
  origin: true, // Replace with your frontend URL
  credentials: true, // Allows cookies, authorization headers, etc.
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});


// Other routes and middleware
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

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
  return res.json({ signature: sdkJWT, data: db })
})



// Define API routes
app.post('/api/data', (req, res) => {
  const data = req.body;
  // console.log('Data received from frontend API:', data);
  res.json({ message: 'Data received successfully', data });
});

io.on('connection', (socket) => {
  // console.log('a user connected');

  socket.on('dataFromFrontend', (data) => {
    // console.log('Data received from frontend (via Socket.io):', data);
    io.emit('message', data);
    console.log(data);
    if (data == "calling") {
      // Call the createMeeting function
      createMeeting();
      // io.emit('url', data);
    }
  });
});


// io.on('connection', (socket) => {
//   console.log('A user connected');

//   // Send data to the client every 5 seconds
//   setInterval(() => {
//       const data = { message: 'Hello from the server!', timestamp: new Date() };
//       socket.emit('message', data);
//   }, 1000);


// });

// // Your credentials
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const accountId = process.env.ACCOUNT_ID;

// Encode client ID and client secret in Base64
const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

// Set up headers for the request
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Authorization': `Basic ${encodedCredentials}`
};

let ACCESS_TOKEN;

// Set up the body of the access token request
const body = new URLSearchParams({
  grant_type: 'account_credentials',
  account_id: accountId // Ensure accountId is defined
});

// Function to get access token from Zoom API
async function getAccessToken() {
  try {
    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: headers, // Ensure headers is defined
      body: body
    });

    // Check if response is OK (status 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    ACCESS_TOKEN = data.access_token;

    // Log the access token and its type
    // console.log('Access Token:', data.access_token);
    // console.log('Token Type:', data.token_type);
    // console.log('Expires In:', data.expires_in); // This is usually 3600 seconds (1 hour)
    // console.log('Scope:', data.scope);
    // console.log('data:', data);
  } catch (error) {
    console.error('Error fetching access token:', error);
  }
}

async function createMeeting() {
  // Call the function to get the access token
  await getAccessToken(); // Wait for the access token to be set

  const url = `https://api.zoom.us/v2/users/me/meetings`;

  const meetingData = {
    topic: 'Sample Meeting',
    type: 1, // Instant Meeting
    duration: 30, // Duration in minutes
    agenda: 'Discuss project updates',
  };

  try {
    const response = await axios.post(url, meetingData, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Meeting start_url:', response.data.start_url);
    console.log('Meeting join_url:', response.data.join_url);

    const startUrl = response.data.start_url;
    const joinUrl = response.data.join_url;

    io.emit('url', joinUrl);
    io.emit('startUrl', startUrl);

    // Route to get the URL data
    app.get('/api/url', (req, res) => {
      res.json({
        start_url: startUrl,
        join_url: joinUrl
      });
    });


  } catch (error) {
    console.error('Error creating meeting:', error.response ? error.response.data : error.message);
  }
}

// Route to get the db data
app.get('/api/users', (req, res) => {
  res.json(db);
});

// // Call the createMeeting function
// createMeeting();

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});