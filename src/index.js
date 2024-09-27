import express from 'express'
const app = express()
// Basic route
app.get('/', (req, res) => {
  res.send('Hello, World2!');
});

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});