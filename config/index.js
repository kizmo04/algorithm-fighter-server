require('dotenv').config();

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PASSWORD_DEV = process.env.DB_PASSWORD_DEV;
const DB_USERNAME_DEV = process.env.DB_USERNAME_DEV;
const JWT_SECRET = process.env.JWT_SECRET;
const config = {
  production: {
    mongoDB: `mongodb://${DB_USERNAME}:${DB_PASSWORD}@ds145911.mlab.com:45911/code_battle`,
  },
  development: {
    mongoDB: `mongodb://${DB_USERNAME}:${DB_PASSWORD}@ds145911.mlab.com:45911/code_battle`
  }
};

module.exports = process.env.NODE_ENV === 'development' ?
{
  jwtSecret: JWT_SECRET,
  ...config.development,
} :
{
  jwtSecret: JWT_SECRET,
  ...config.production,
}


