import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';  // Import cors
import helmet from 'helmet';
import { getTableDetails } from './routes/fetchTerminals.js';
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

// updateUserStatus(1, 'inactive')
getTableDetails();

// dotenv.config(); 
// dotenv.config()
const port = process.env.PORT || 4000;

const app = express();
app.use(express.json(), cors())
app.options('*', cors())

app.use('/', signature);

// app.patch('/api/person/:id', async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body; // Expecting the new status in the request body

//   try {
//       const result = await pool.query(
//           'UPDATE persons SET status = $1 WHERE id = $2 RETURNING *',
//           [status, id]
//       );

//       if (result.rows.length > 0) {
//           res.json({
//               message: 'Status updated successfully',
//               person: result.rows[0],
//           });
//       } else {
//           res.status(404).json({ message: 'Person not found' });
//       }
//   } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Error updating status' });
//   }
// });

// console.log(144,await getTableDetails())

app.post('/api/userActivity', async(req, res) => {
  const { id, personStatus } = req.body;
  console.log('Received:', req.body);

  // Respond with a success message
  res.json({ message: 'Data received successfully', data: { id, personStatus } });

  updateUserStatus(id, personStatus)

});

app.post('/user/activity', (req, res) => {
  const { active } = req.body;
  
  if (!active) {
    console.log('User is inactive');
  } 

  res.status(200).send('Activity status received');
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await getTableDetails(); // Await inside an async function
    res.json(users);
    console.log(155)
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