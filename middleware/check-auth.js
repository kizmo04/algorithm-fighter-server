const jwt = require('jsonwebtoken');
const {
  TokenExpiredError,
  AuthenticationError,
} = require('../lib/errors');

 module.exports = (req, res, next) => {
   try {
    const token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, err => {
      if (err) {
        next(new TokenExpiredError());
      } else {
        next();
      }
    });
  } catch (error) {
    next(new AuthenticationError());
  }
};
