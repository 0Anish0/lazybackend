const jwt = require('jsonwebtoken');

// Middleware to verify if the user is an admin
const jwtMiddleware = (req, res, next) => {
  const token = req.headers['auth-token'] ? req.headers['auth-token'] : req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.userId = decoded.userId;
    req.role = decoded.role; // Store role in the request
    req.first_name = decoded.first_name;
    req.last_name = decoded.last_name;
    req.mobile = decoded.mobile;
    req.password = decoded.password;
    req.gender = decoded.gender;
    req.country = decoded.country;
    req.state = decoded.state;
    req.city = decoded.city;
    req.live_image = decoded.live_image;
    next();
  });
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { jwtMiddleware, isAdmin };