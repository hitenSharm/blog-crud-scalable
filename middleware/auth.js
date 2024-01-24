const { secretKey } = require("../config/config");
const jwt = require('jsonwebtoken');


const authenticate = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader.split(' ')[1];
    
    if (!token) {
       //no token found
      return res.status(401).json({ message: 'Unauthorized' });
    }
      
    try {
      const decoded = jwt.verify(token, secretKey);  
      req.userId = decoded.userId;
      next();
    } catch (error) {
      console.error(error)
      res.status(401).json({ message: 'Invalid token' });
    }
  };
  
  module.exports = authenticate;