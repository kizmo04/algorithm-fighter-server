const jwt = require('jsonwebtoken');
const ERRORS = require('../lib/errors');

 module.exports = (req, res, next) => {
  try {
    const token = req.body.token;
    // const token = req.headers.authorization.split(' ')[1];// headers.authorization === 'Bearer ejwkqlelj~~'
    jwt.verify(token, 'dragon', function(err, decoded) {
      if (err) {
        next(new ERRORS.TokenExpiredError());
      } else {

      }
    });
    next();
  } catch (error) {
    next(ERRORS.AuthenticationError);
  }
  next();
};
