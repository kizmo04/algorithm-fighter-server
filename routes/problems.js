const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const mongoose = require('mongoose');
const {
  ServerError,
  InvalidParameterError,
} = require('../lib/errors');
const {
  validateString,
  validateTestCase,
} = require('../models/utils/validator');

router.get('/', (req, res, next) => {
  Problem.find()
  .then(problems => {
    res.status(200).json(problems);
  })
  .catch(err => next(new ServerError()));
});

router.get('/random', (req, res, next) => {
  const { u_id, p_id } = req.query; // u_id == user_id, p_id === partner_id

  if (!mongoose.Types.ObjectId.isValid(u_id) || !mongoose.Types.ObjectId.isValid(p_id) || u_id === p_id) {
    next(new InvalidParameterError('user id'));
    return;
  }

  Problem.find({ completed_from: { $not: { $in: [u_id, p_id] }}, created_from: { $not: { $in: [u_id, p_id]}}})
  .then(problems => {
    if (problems.length) {
      res.status(200).json(problems[Date.now() % problems.length]);
    } else {
      Problem.find()
      .then(problems => {
        res.status(200).json(problems[Date.now() % problems.length]);
      });
    }
  })
  .catch(err => next(new ServerError()));
});

router.post('/', (req, res, next) => {
  const { title, description, difficulty_level, initial_code, created_from, tests } = req.body;

  if (!validateString(title)) {
    next(new InvalidParameterError('title'));
    return;
  } else if (!validateString(description)) {
    next (new InvalidParameterError('description'));
    return;
  } else if (!validateString(initial_code)) {
    next(new InvalidParameterError('initial code'));
    return;
  } else if (!mongoose.Types.ObjectId.isValid(created_from)) {
    next(new InvalidParameterError('user id'));
    return;
  } else if (!Number.isInteger(Number(difficulty_level))) {
    next(new InvalidParameterError('difficulty level'));
    return;
  } else if (!Array.isArray(tests) || !tests.length || !validateTestCase(tests)) {
    next(new InvalidParameterError('test case'));
    return;
  }

  let newProblem = new Problem({
    title,
    description,
    difficulty_level,
    initial_code,
    created_from,
    tests,
  });

  newProblem.save()
  .then(problem => {
    res.status(201).json(problem);
  })
  .catch(err => next(new ServerError()));
});

module.exports = router;
