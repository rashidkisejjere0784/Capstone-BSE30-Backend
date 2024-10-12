const express = require('express'); // Importing the express module
const AuthController = require('../Controllers/authController');

const route = express.Router();

route.post('/auth/signup', AuthController.SignUp);
route.post('/auth/signin', AuthController.SignIn);

module.exports = route;
