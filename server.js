const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
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

mongoose
  .connect(dbURI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.log('Connection error:', error));

app.use(
  cors({
    origin: process.env.FRONTEND_SERVER || 'http://127.0.0.1:5173',
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

app.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Origin',
    process.env.FRONTEND_SERVER || 'http://127.0.0.1:5173',
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cache-Control, Expires, Pragma',
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.options('*', cors());

app.use(express.json());
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy!');
});

const closeDatabase = async () => {
  await mongoose.connection.close();
};

module.exports = { app, closeDatabase };
