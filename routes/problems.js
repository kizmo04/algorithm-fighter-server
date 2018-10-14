const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const TestSchema = require('../models/Test');
const {
  ServerError,
} = require('../lib/errors');

router.get('/', (req, res, next) => {
  // 문제 랜덤하게 골라서 보내주기?
  Problem.find()
  .then(problems => {
    res.status(200).json(problems);
  })
  .catch(err => {
    next(new ServerError());
  });
});

router.get('/:problem_id', (req, res, next) => {
  Problem.findOne({ _id: req.params.problem_id })
  then(problem => {
    res.status(200).json(problem);
  })
  .catch(err => {
    next(new ServerError());
  });
});

router.post('/', (req, res, next) => {
  const { title, description, difficulty_level, initial_code, created_from, tests } = req.body;

  let newProblem = new Problem({
    title,
    description,
    difficulty_level,
    initial_code,
    created_from,
    tests: [{input: "'rkqodlw','world'", output: true },
    {input: "'cedewaraaossoqqyt','codewars'", output: true },
    {input: "'katas','steak'", output: false },
    {input: "'scriptjava','javascript'", output: true },
    {input: "'script{ingjava','javascript'", output: true },
    {input: "'scriptsjava','javascripts'", output: true },
    {input: "'jscripts','javascript'", output: false },
    {input: "'aabbcamaomsccdd','commas'", output: true }],
  });

  newProblem.save()
  .then(problem => {
    res.status(201).json(problem);
  })
  .catch(err => {
    next(new ServerError());
  });
});

module.exports = router;
