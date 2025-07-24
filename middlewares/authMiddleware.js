const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware to verify the token
module.exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from header

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  // Verify JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Failed to authenticate token' });

    req.user = decoded; // Save decoded user data to req.user
    next(); // Proceed to next middleware or route handler
  });
};
