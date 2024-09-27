import express from 'express';
const app = express();

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Use the port from Render's environment or default to 10000
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Zoom Meeting SDK Auth Endpoint Sample Node.js, listening on port ${port}!`);
});
