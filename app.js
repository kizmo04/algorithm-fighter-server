const cors = require("cors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const config = require("./config");


mongoose.connect(
  config.mongoDB,
  { useNewUrlParser: true }
);
mongoose.set("useCreateIndex", true);

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const matchesRouter = require("./routes/matches");
const problemsRouter = require("./routes/problems");

const app = express();

const IS_DEV = process.env.NODE_ENV !== 'production';

const whitelist = [];

if (IS_DEV) {
  whitelist.push('http://localhost:3000');
} else {
  whitelist.push('https://alrogithmfighter.com');
}

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/problems", problemsRouter);



app.use(function(err, req, res, next) {
  res.status(err.status).json({ message: err.message });
});

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error("Not Found");
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

module.exports = app;
