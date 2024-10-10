import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';  // Import cors
// import { getTableDetails } from './routes/fetchTerminals.js';
// import { updateUserStatus } from './routes/updateTerminal.js';
import http from 'http';
import { createMeeting } from './createMeeting.js';
import signature from './signature.js';

// updateUserStatus(1, 'inactive5')
// getTableDetails();

// dotenv.config(); 
// dotenv.config()
const port = process.env.PORT || 4000;

const app = express();
app.use(express.json(), cors())
app.options('*', cors())

app.use('/', signature);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Allow requests from this origin
    methods: ['GET', 'POST'], // Specify allowed methods
    credentials: true, // Allow cookies or authentication headers
  },
});

// Use CORS middleware to enable cross-origin requests
// app.use(cors({
//   // origin: 'https://zoomfrontendapp.netlify.app', // Your frontend's origin
//   origin: true,// Your frontend's origin
//   methods: ['GET', 'POST'],
//   credentials: true,
// }));

// app.use(helmet());

// // Customizing Content-Security-Policy
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on your app's needs
//       objectSrc: ["'none'"],
//       upgradeInsecureRequests: [],
//     },
//   })
// );

// // Referrer-Policy (no-referrer-when-downgrade is a common policy)
// app.use(helmet.referrerPolicy({ policy: 'no-referrer-when-downgrade' }));

// const corsOptions = {
//   origin: true, // Replace with your frontend URL
//   credentials: true, // Allows cookies, authorization headers, etc.
// };

// app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// // Other routes and middleware
// app.get('/', (req, res) => {
//   res.send('Hello, World!');
// });

app.options('*', cors());

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('dataFromFrontend', async (data) => {
    // console.log('Data received from frontend (via Socket.io):', data);
    io.emit('message', data);
    console.log(111, data);
    if (data == "calling") {

      // Call the createMeeting function
      const meetingData = await createMeeting();
      io.emit('url', meetingData.join_url);
      io.emit('startUrl', meetingData.start_url);
    }
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});