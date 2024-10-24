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
// import {  server, io } from './routes/handleSocket.js';

// Test the database connection
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    // console.log('Connected to the PostgreSQL database');
  }
});

// getUserDetails();
const port = process.env.PORT || 4000;

const app = express();
app.use(express.json(), cors())
app.options('*', cors())

app.use('/', signature);

app.post('/api/terminalActivity', async (req, res) => {
  const { terminal_id, personStatus } = req.body;
  // // console.log('Received:', req.body);
  // // console.log(122);

  // Respond with a success message
  res.json({ message: 'Data received successfully', data: { terminal_id, personStatus } });
  updateUserStatus(terminal_id, personStatus)
});

app.get('/api/terminals', async (req, res) => {
  // // console.log(157)
  try {
    const users = await getTerminalDetails(); // Await inside an async function
    res.json(users);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.get('/api/users', async (req, res) => {
  // // console.log(257)
  try {
    const users = await getUserDetails(); // Await inside an async function
    res.json(users);
    // // console.log(255)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// // console.log(145)

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
  origin: true,// Your frontend's origin
  methods: ['GET', 'POST'],
  credentials: true,
}));

// app.options('*', cors());

let userRequests = []

io.on('connection', (socket) => {
  // console.log('a user connected');

  socket.on('dataFromFrontend', async (data) => {
    // // console.log('Data received from frontend (via Socket.io):', data);
    let connectingLink = data.dial

    // const meetingData = {
    //   url:matchedTerminal.zoom_url,
    //   uniqueId: matchingResult.uniqueId,
    //   terminal_id:matchedTerminal.terminal_id
    // };

    // io.emit('url', meetingData);
    // console.log(114, connectingLink);

    // // console.log(115, data);
    // // console.log(116, data.uniqueId);
    if (connectingLink == 'disconnected') {

      // console.log(115, data)

      const adminData = {
        connectingLink: connectingLink,
        uniqueId: data.uniqueId
      };

      // console.log(215, data)

      io.emit('message', adminData);
      userRequests = userRequests.filter(item => item.uniqueId !== data.uniqueId);
    }
    if (connectingLink == 'calling') {
      // io.emit('message', adminData);
      // console.log(117, data);


      userRequests.push(data); // Push data into the userRequests array
      // console.log(217, userRequests);
      // // console.log(116, data.translateLanguage, data.institutionid);
      // // console.log(118, userRequests);

      // let terminalData;
      // let intervalId;

      // async function fetchTerminalData() {
      //   terminalData = await getTerminalDetails();
      //   // // console.log(terminalData);  // This will log the data every second

      //   const matchedTerminals = terminalData.filter(
      //     person => person.languages_known.includes(data.translateLanguage) && person.status === 'active'
      //   );

      //   if (matchedTerminals.length > 0) {
      //     // // console.log(189, matchedTerminals);
      //     const meetingData = createMeeting();
      //     io.emit('url', meetingData);
      //     io.emit('startUrl', meetingData);
      //     clearInterval(intervalId);
      //   }
      //   else {
      //     // // console.log(189, "no speakers");
      //   }
      // }

      // // Run the function every second and store the interval ID
      // intervalId = setInterval(fetchTerminalData, 1000);
    }

    if (connectingLink == 'terminal joined') {
      console.log(115, data, 'terminal joined');
      const adminData = {
        connectingLink: connectingLink,
        terminal_id: data.terminal_id,
        uniqueId: data.uniqueId
      };

      io.emit('message', adminData);
    }

    let matchingResult = null;

    function connectUserTerminal() {

      async function loopToConnect() {
        console.log("userRequests.length", userRequests.length, userRequests)
        // Loop through the data array
        if (userRequests.length > 0) {
          for (let i = 0; i < userRequests.length; i++) {

            let terminalData = await getTerminalDetails();

            // // console.log(1144, terminalData)

            terminalData = terminalData.filter(
              person => person.status === 'active'
            );

            // // console.log(1145, terminalData)

            terminalData.sort((a, b) => new Date(a.event_time) - new Date(b.event_time));

            // console.log(32146, userRequests[i])

            // console.log(11377, userRequests);

            const languagesTranslated = [...new Set(terminalData.flatMap(item => item.languages_known))];

            // Check if the translateLanguage matches any in languagesToCheck
            if (userRequests[i] && languagesTranslated.includes(userRequests[i].translateLanguage)) {
              matchingResult = {
                translateLanguage: userRequests[i].translateLanguage,
                uniqueId: userRequests[i].uniqueId
              };

              const matchedTerminal = terminalData.find(person => person.languages_known.includes(matchingResult.translateLanguage) && person.status === 'active');

              if (matchedTerminal) {
                // console.log(1245, matchedTerminal, "found terminal")

                const meetingData = {
                  url: matchedTerminal.zoom_url,
                  uniqueId: matchingResult.uniqueId,
                  terminal_id: matchedTerminal.terminal_id
                };

                const adminData = {
                  connectingLink: 'calling',
                  terminal_id: matchedTerminal.terminal_id,
                  uniqueId: matchingResult.uniqueId,
                };

                // console.log(3177, adminData);

                io.emit('message', adminData);

                io.emit('url', meetingData);
                io.emit('startUrl', meetingData);

                // console.log(1177, userRequests, matchingResult.uniqueId);

                userRequests = userRequests.filter(item => item.uniqueId !== matchingResult.uniqueId)

                // console.log(1277, userRequests, matchingResult.uniqueId);
              }
              else {
                matchingResult = "did not find terminal";
                // console.log(1146, matchingResult)
              }
              // clearInterval(intervalId);
              // df
              // break; // Exit the loop once a match is found
            }
          }
        } else {
          console.log("no user requests")
        }
      }
      if (userRequests.length > 0) {
        return loopToConnect()
      }
    }

    connectUserTerminal()

    // setInterval(connectUserTerminal, 1000);

    // function checkUserRequests() {
    //   if (userRequests.length > 0) {
    //     // If the condition is satisfied, call connectUserTerminal once
    //     connectUserTerminal();
    //   } else {
    //     // If the condition is not satisfied, check again after 5 seconds
    //     setTimeout(checkUserRequests, 5000);
    //   }
    // }

    // // Start the checking process
    // checkUserRequests();

    // connectUserTerminal()

    // if(userRequests.length > 0) {
    //   setInterval(connectUserTerminal, 5000);
    // }



    // // console.log(244,  matchingUniqueId,typeof matchingUniqueId);
    // // console.log(244, typeof matchingUniqueId);





    // if (matchedTerminals.length > 0) {
    //   // // console.log(189, matchedTerminals);
    //   const meetingData = createMeeting();
    //   io.emit('url', meetingData);
    //   io.emit('startUrl', meetingData);
    //   // clearInterval(intervalId);
    // }
    // else {
    //   // // console.log(189, "no speakers");
    // }

    // let terminalData;
    // let intervalId;

    // async function fetchTerminalData() {
    //   terminalData = await getTerminalDetails();
    //   // // console.log(terminalData);  // This will log the data every second

    //   // // console.log(151,terminalData)

    //   const matchedTerminals = terminalData.filter(
    //     person => person.languages_known.includes(data.translateLanguage) && person.status === 'active'
    //   );

    //   // console.log(155,matchedTerminals)

    //   if (matchedTerminals.length > 0) {
    //     // // console.log(189, matchedTerminals);
    //     const meetingData = createMeeting();
    //     io.emit('url', meetingData);
    //     io.emit('startUrl', meetingData);
    //     clearInterval(intervalId);
    //   }
    //   else {
    //     // // console.log(189, "no speakers");
    //   }
    // }

    // Run the function every second and store the interval ID
    // intervalId = setInterval(fetchTerminalData, 1000);


    // Call the createMeeting function
    // const meetingData = await createMeeting();
    // io.emit('url', meetingData.join_url);
    // io.emit('startUrl', meetingData.start_url);

  });

  // socket.on('userUniqueId', async (data) => {
  //   console.log(133,data)
  // });
});

// Start the server
server.listen(port, () => {
  // console.log(`Server listening on port ${port}`);
});