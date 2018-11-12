const cors = require("cors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const config = require("./config");
const cronTask = require("./lib/cron");

mongoose.connect(
  config.mongoDB,
  { useNewUrlParser: true }
);
mongoose.set("useCreateIndex", true);

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB Connected...");
});

cronTask.start();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const matchesRouter = require("./routes/matches");
const problemsRouter = require("./routes/problems");

const app = express();

const IS_DEV = process.env.NODE_ENV !== "production";

const whitelist = [
  "https://www.algorithm-fighter.live",
  "https://algorithm-fighter.live"
];

const corsOptions = {
  origin: function(origin, callback) {
    if (IS_DEV) {
      callback(null, true);
    } else if (!IS_DEV) {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
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
  if (
    process.env.NODE_ENV !== "local" &&
    !req.secure &&
    req.get("X-Forwarded-Proto") === "http"
  ) {
    res.redirect("https://" + req.get("Host") + req.url);
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

module.exports = app;
