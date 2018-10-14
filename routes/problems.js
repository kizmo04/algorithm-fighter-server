const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const mongoose = require('mongoose');
const {
  ServerError,
  InvalidUserIdError,
  DuplicateObjectIdError,
  InvalidTestCaseError,
  InvalidDifficultyLevelError,
  InvalidInitialCodeError,
  InvalidDescriptionError,
  InvalidTitleError,
  InvalidCreatedUserError,
} = require('../lib/errors');

router.get('/', (req, res, next) => {
  Problem.find()
  .then(problems => {
    res.status(200).json(problems);
  })
  .catch(err => {
    next(new ServerError());
  });
});

router.get('/random', (req, res, next) => {
  const { u_id, p_id } = req.query; // u_id == user_id, p_id === partner_id

  if (!mongoose.Types.ObjectId.isValid(u_id) || !mongoose.Types.ObjectId.isValid(p_id)) {
    next(new InvalidUserIdError());
  } else if (u_id === p_id) {
    next(new DuplicateObjectIdError());
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
  .catch(err => {
    res.send(err);
    next(new ServerError());
  });
});

router.post('/', (req, res, next) => {
  const { title, description, difficulty_level, initial_code, created_from, tests } = req.body;

  if (!validateString(title)) {
    next(new InvalidTitleError());
  } else if (!validateString(description)) {
    next (new InvalidDescriptionError());
  } else if (!validateString(initial_code)) {
    next(new InvalidInitialCodeError());
  } else if (!mongoose.Types.ObjectId.isValid(created_from)) {
    next(new InvalidCreatedUserError());
  } else if (!Number.isInteger(JSON.parse(difficulty_level))) {
    next(new InvalidDifficultyLevelError());
  } else if (!tests.length) {
    next(new InvalidTestCaseError());
  } else if (!validateTestCase(tests)) {
    next(new InvalidTestCaseError());
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
  .catch(err => {
    next(new ServerError());
  });
});

function validateString(str) {
  return typeof str === 'string' && !!str.trim();
}

function validateTestCase(tests) {
  return tests.every(test => {
    return typeof test.input === 'string' && typeof test.expected_output === 'string';
  });
}

module.exports = router;
