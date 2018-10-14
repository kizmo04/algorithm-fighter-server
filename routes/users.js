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
  InvalidParameterError,
} = require('../lib/errors');
const checkAuth = require('../middleware/check-auth');

router.use(checkAuth);

router.get('/', (req, res, next) => {
  User.find()
  .then(users => {
    res.status(200).json(users);
  })
  .catch(err => next(new ServerError()));
});

router.get('/:user_id', (req, res, next) => {
  const { user_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    next(new InvalidParameterError('user id'));
    return;
  }

  User.findById(user_id)
  .then(user => {
    if (!user) {
      next(new InvalidParameterError('user id'));
    } else {
      res.status(200).json(user);
    }
  })
  .catch(err => next(new ServerError()));
});

router.put('/:user_id', (req, res, next) => {
  const { code, problem_id } = req.body;
  const { user_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(problem_id)) {
    next(new InvalidParameterError('problem id'));
    return;
  } else if (!mongoose.Types.ObjectId.isValid(user_id)) {
    next(new InvalidParameterError('user id'));
    return;
  }

  async.waterfall(
    [
      cb => {
        Problem.findById(problem_id)
        .then(problem => {
          if (!problem) {
            cb(new InvalidParameterError('problem id'));
          } else {
            cb(null, code, problem.tests);
          }
        })
        .catch(err => cb(err));
      },
      (code, tests, cb) => {
        cb(null, checkSolution(code, tests));
      },
      (err, result) => {
        if (err) {
          cb(new ServerError());
          return;
        }
        const { testResult, code, countPassed, isPassedAll } = result;

        if (isPassedAll) {
          Promise.all([
            Problem.findOneAndUpdate({ _id: problem_id }, { $push: { completed_from: user_id }}),
            User.findByIdAndUpdate(user_id, { $push: { solutions: { problem_id, code} }}),
          ])
          .then(() => {
            cb(null, { testResult, countPassed, isPassedAll });
          })
          .catch(err => cb(new ServerError()));
        } else {
          cb(null, { testResult, countPassed, isPassedAll });
        }
      },
    ],
    (err, result) => {
      if (err) {
        next(new ServerError());
      } else {
        res.status(200).json(result);
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
      expected_output: test.expected_output,
      solution_output: solutionOutput,
      pass,
    };
  });
  return { testResult, countPassed, isPassedAll };
}

module.exports = router;
