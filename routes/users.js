const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Problem = require('../models/Problem');
const vm = require("vm");
const util = require("util");
const async = require('async');
const mongoose = require('mongoose');
const {
  ServerError,
  InvalidProblemIdError,
  InvalidUserIdError,
} = require('../lib/errors');


router.get('/', function(req, res, next) {
  User.find()
  .then(users => {
    res.status(200).json(users);
  })
  .catch(err => {
    next(new ServerError());
  });
});

router.get('/:user_id', (req, res, next) => {
  const { user_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    next(new InvalidUserIdError());
  }

  User.findById(user_id)
  .then(user => {
    res.status(200).json(user);
  })
  .catch(err => {
    next(new ServerError());
  });
});

router.put('/:user_id', (req, res, next) => {
  const { code, problem_id } = req.body;
  const { user_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(problem_id)) {
    next(new InvalidProblemIdError());
  } else if (!mongoose.Types.ObjectId.isValid(user_id)) {
    next(new InvalidUserIdError());
  }

  async.waterfall(
    [
      cb => {
        Problem.findById(problem_id)
        .then(problem => {
          cb(null, code, problem.tests);
        })
      },
      (code, tests, cb) => {
        cb(null, checkSolution(code, tests));
      },
    ],
    (err, { testResult, code, countPassed, isPassedAll }) => {
      if (err) {
        next(new ServerError());
      }
      if (isPassedAll) {
        Promise.all([
          Problem.findOneAndUpdate({ _id: problem_id }, { $push: { completed_from: user_id }}),
          User.findByIdAndUpdate(user_id, { $push: { solutions: { problem_id, code} }}),
        ])
        .then(() => {
          res.status(200).json({ testResult, countPassed, isPassedAll });
        })
        .catch(err => {
          next(new ServerError());
        });
      } else {
        res.status(200).json({ testResult, countPassed, isPassedAll });
      }
    }
  );
});

function checkSolution (code, tests) {
  let sandBox;
  let script;
  let context;
  let countPassed = 0;
  let isPassedAll = false;

  let testResult = tests.map(test => {
    sandBox = {
      solutionOutput: null,
      solutionIsPassed: null,
    };
    let codeToCheck = code + `\nsolutionOutput = solution(${ test.input })`;
    codeToCheck += `\nsolutionIsPassed = solutionOutput === ${ test.output } \n`;
    context = vm.createContext(sandBox);
    script = new vm.Script(codeToCheck);
    script.runInContext(context, {
      displayErrors: true,
      timeout: 1000
    });
    const pass = new Boolean(util.inspect(sandBox.pass));
    const solutionOutput = util.inspect(sandBox.solutionOutput);
    if (pass) countPassed++;
    if (countPassed === tests.length) isPassedAll = true;
    return {
      input: test.input,
      output: test.output,
      solutionOutput,
      pass,
    };
  });
  return { testResult, countPassed, isPassedAll };
}

module.exports = router;
