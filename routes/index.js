const express = require('express');
const router = express.Router();
const { EmailNotFoundError, ServerError, InvalidEmailError, InvalidPasswordError } = require('../lib/errors');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/auth', function(req, res, next) {
  const { email, name, user_name, short_bio, profile_image_url } = req.body;

  if (email === '') return next(new EmailNotFoundError());

  User.findOne({ email }, (err, user) => {
    if (err) {
      next(new ServerError());
    } else {
      if (user) {
        jwt.sign({
          _id: user._id,
          email: user.email,
          profileImageUrl: user.profile_image_url,
          name: user.name,
          userName: user.user_name,
          shortBio: user.short_bio
        }, config.jwtSecret, { expiresIn: '7d' }, (err, token) => {
          if (err) {
            next(new ServerError());
          } else {
            res.status(200).json({
              user,
              token
            });
          }
        });
      } else {
        const newUser = new User({
          email,
          name,
          user_name,
          short_bio,
          profile_image_url
        });
        newUser.save()
        .then(user => {
          jwt.sign({
            _id: user._id,
            email: user.email,
            profileImageUrl: user.profile_image_url,
            name: user.name,
            userName: user.user_name,
            shortBio: user.short_bio
          }, config.jwtSecret, { expiresIn: '7d' }, (err, token) => {
            if (err) {
              next(new ServerError());
            } else {
              res.status(201).json({
                user,
                token
              });
            }
          });
        })
        .catch(err => {
          if (err.errors.email && err.errors.email.name === 'ValidatorError') {
            next(new InvalidEmailError());
          } else if (err.errors.password && err.errors.password.name === 'ValidatorError') {
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
