const jwt = require('jsonwebtoken');

// Middleware to check the validity of the token
const verifyToken = (req, res, next) => {
  let token = req.header('Authorization');
  // const token = req.cookies.token

  if (token) {
    token = token.replace('Bearer ', '');
  }
  console.log(token);

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token with the secret key
    const secretKey = 'CLIENT_SECRET_KEY';
    const decoded = jwt.verify(token, secretKey);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyToken;
