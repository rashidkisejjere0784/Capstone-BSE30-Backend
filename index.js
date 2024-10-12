const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require('cors');
const routes = require('./routes');

const ORIGIN = 'http://localhost:5173';

dotenv.config();

const app = express();
app.use(express.json());
mongoose.set('debug', true);
app.use(
  cors({
    origin: ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }),
);
// Define the port variable
const port = 8080;

// MongoDB connection URI
const dbURI =
  'mongodb+srv://user123:user123@capstonebackend.o78na.mongodb.net/capstone-backend?retryWrites=true&w=majority';

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
