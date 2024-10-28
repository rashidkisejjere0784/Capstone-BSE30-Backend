const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require('cors');
const routes = require('./routes');

dotenv.config();
const dir = path.join(__dirname, '/uploads');
const app = express();
const port = process.env.PORT || 3000;
app.use('/uploads', express.static(dir));

const dbURI =
  'mongodb+srv://user123:user123@capstonebackend.o78na.mongodb.net/capstone-backend?retryWrites=true&w=majority';

mongoose.set('debug', true);
// MongoDB connection URI

// Connect to MongoDB
mongoose
  .connect(dbURI)
  .then(() => {
    // Start the server after successful connection
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.log('Connection error:', error));
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'Expires',
      'Pragma',
    ],
    credentials: true,
  }),
);

app.use(express.json());

// Define API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy!');
});

// Function to close the mongoose connection
const closeDatabase = async () => {
  await mongoose.connection.close();
};

// Export the app, server, and close function
module.exports = { app, closeDatabase };