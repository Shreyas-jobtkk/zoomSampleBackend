import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';  // Import cors
import { getTerminalDetails } from './routes/fetchTerminals.js';
import { getUserDetails } from './routes/fetchUsers.js';
import { updateUserStatus } from './routes/updateTerminal.js';
import http from 'http';
import { createMeeting } from './createMeeting.js';
import signature from './signature.js';
import pool from './db.js';

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Connected to the PostgreSQL database');
  }
});

// const sampleData = {
//   terminal_id: 5,
//   person_name: 'John Doe',
//   institution_id: 101,
//   name_of_institution: 'Tech Corp',
//   call_started: '2024-10-15 09:30:00',
//   call_ended: '2024-10-15 09:45:00',
//   duration: '00:15:00',
// }

// await pool.query(
//   `INSERT INTO callLog (terminal_id, person_name, institution_id, name_of_institution, call_started, call_ended, duration)
//    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
//   [
//     sampleData.terminal_id,
//     sampleData.person_name,
//     sampleData.institution_id,
//     sampleData.name_of_institution,
//     sampleData.call_started,
//     sampleData.call_ended,
//     sampleData.duration,
//   ]
// );

// getUserDetails();
const port = process.env.PORT || 4000;

const app = express();
app.use(express.json(), cors())
app.options('*', cors())

app.use('/', signature);

app.post('/api/terminalActivity', async (req, res) => {
  const { terminal_id, personStatus } = req.body;
  console.log('Received:', req.body);
  console.log(122);

  // Respond with a success message
  res.json({ message: 'Data received successfully', data: { terminal_id, personStatus } });
  updateUserStatus(terminal_id, personStatus)
});

app.get('/api/terminals', async (req, res) => {
  console.log(157)
  try {
    const users = await getTerminalDetails(); // Await inside an async function
    res.json(users);
    console.log(155)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.get('/api/users', async (req, res) => {
  console.log(257)
  try {
    const users = await getUserDetails(); // Await inside an async function
    res.json(users);
    console.log(255)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// console.log(145)

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Allow requests from this origin
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