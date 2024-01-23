module.exports = {
    secretKey: 'serverJWTKey', 
    mongoURI: 'mongodb://127.0.0.1:27017/bloggingPlatform', 
    rateLimitConfig: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // limit each IP to 100 requests per windowMs 
    },
  };