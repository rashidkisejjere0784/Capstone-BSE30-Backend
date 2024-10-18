const express = require('express'); // Importing the express module
const AuthController = require('../Controllers/authController');

const route = express.Router();

route.post('/auth/signup', AuthController.SignUp);
route.post('/auth/signin', AuthController.SignIn);
route.post('/auth/logout', AuthController.logoutUser);

route.get('/auth/check-auth', AuthController.authMiddleware, (req, res) => {
  const { user } = req;
  res.status(200).json({
    success: true,
    message: 'Authenticated user!',
    user,
  });
});

module.exports = route;
