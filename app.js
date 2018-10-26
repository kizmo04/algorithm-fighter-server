const cors = require("cors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const config = require("./config");
const cronTask = require('./lib/cron');

mongoose.connect(
  config.mongoDB,
  { useNewUrlParser: true },
);
mongoose.set("useCreateIndex", true);

const db = mongoose.connection;

db.once('open', () => {
  console.log('DB Connected...');
})

cronTask.start();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const matchesRouter = require("./routes/matches");
const problemsRouter = require("./routes/problems");

const app = express();

const IS_DEV = process.env.NODE_ENV !== 'production';

const whitelist = ['https://www.kizmo04.com', 'https://kizmo04.com'];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('it is origin!!!!', origin);

    if (IS_DEV) {
      callback(null, true);
    } else if (!IS_DEV) {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }
};

app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log('FORWARED PROTO:', req.get('X-Forwarded-Proto'));
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('IS SECURE:', req.secure);

  if (process.env.NODE_ENV !== 'local' && (!req.secure) && (req.get('X-Forwarded-Proto') === 'http')) {
    res.redirect('https://' + req.get('Host') + req.url);
  } else {
    next();
  }
});

app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/problems", problemsRouter);

app.use(function(err, req, res, next) {
  res.status(err.status ? err.status : 500).json({ message: err.message });
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
