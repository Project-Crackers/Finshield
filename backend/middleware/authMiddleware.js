const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  console.log('Authorization header:', req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const JWT_SECRET = process.env.JWT_SECRET || "MY_NAME_IS_GOPINATH";
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = await User.findById(decoded.userId || decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
};

module.exports = protect;
