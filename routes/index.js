const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const config = require("../config");
const {
  InvalidImageUrlError,
  ServerError,
  InvalidEmailError,
  InvalidPasswordError
} = require("../lib/errors");
const { URL_REGEX, EMAIL_REGEX } = require("../models/constants/regex");

router.get("/", (req, res, next) => {
  res.json({ message: "hello" });
});

router.post("/auth", (req, res, next) => {
  const { email, name, user_name, short_bio, profile_image_url } = req.body;

  if (!EMAIL_REGEX.test(email)) {
    next(new InvalidEmailError());
    return;
  } else if (!URL_REGEX.test(profile_image_url)) {
    next(new InvalidImageUrlError());
    return;
  }

  User.findOne({ email }, (err, user) => {
    if (err) {
      next(new ServerError());
    } else {
      if (user) {
        jwt.sign(
          {
            _id: user._id,
            email: user.email,
            profileImageUrl: user.profile_image_url,
            name: user.name,
            userName: user.user_name,
            shortBio: user.short_bio,
            solutions: user.solutions,
            createdAt: user.created_at
          },
          config.jwtSecret,
          { expiresIn: "7d" },
          (err, token) => {
            if (err) {
              next(new ServerError());
            } else {
              res.status(200).json({
                token
              });
            }
          }
        );
      } else {
        const newUser = new User({
          email,
          name,
          user_name,
          short_bio,
          profile_image_url
        });
        newUser
          .save()
          .then(user => {
            jwt.sign(
              {
                _id: user._id,
                email: user.email,
                profileImageUrl: user.profile_image_url,
                name: user.name,
                userName: user.user_name,
                shortBio: user.short_bio,
                solutions: user.solutions,
                createdAt: user.created_at
              },
              config.jwtSecret,
              { expiresIn: "7d" },
              (err, token) => {
                if (err) {
                  next(new ServerError());
                } else {
                  res.status(201).json({
                    token
                  });
                }
              }
            );
          })
          .catch(err => {
            if (
              err.errors.email &&
              err.errors.email.name === "ValidatorError"
            ) {
              next(new InvalidEmailError());
            } else if (
              err.errors.password &&
              err.errors.password.name === "ValidatorError"
            ) {
              next(new InvalidPasswordError());
            } else {
              next(new ServerError());
            }
          });
      }
    }
  });
});

module.exports = router;
