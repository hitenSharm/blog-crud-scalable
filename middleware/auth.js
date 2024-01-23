const { secretKey } = require("../config/config");
const jwt = require('jsonwebtoken');


const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
  
    if (!token) {
       //no token found
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, secretKey);
      console.log(decoded);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
  
  module.exports = authenticate;