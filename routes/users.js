const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Problem = require('../models/Problem');
const vm = require("vm");
const util = require("util");
const async = require('async');
const {
  ServerError,
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
  User.findById(req.params.user_id)
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
  const tasks = [
  cb => {
    Problem.findById(problem_id)
    .then(problem => {
      console.log('problem', problem);
      cb(null, code, problem.tests);
    })
  },
  (code, tests, cb) => {
    console.log('tests', tests);
    console.log('code', code);
    cb(null, checkSolution(code, tests));
  }
  ];

  async.waterfall(
    tasks,
    (err, { testResult, code, countPassed, isPassedAll }) => {
      if (err) {
        next(new ServerError());
      }
      if (isPassedAll) {
        User.findByIdAndUpdate(user_id, { $push: { solutions: { problem_id, code} }})
        .then(user => {
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
    console.log('input: ', test.input)
    sandBox = {
      solutionOutput: null,
      solutionIsPassed: null,
    };
    code += '\nsolutionOutput = solution(' + test.input + ')';
    code += `\nsolutionIsPassed = solutionOutput === ${typeof test.output === "string" ? '"' + test.output + '"' : test.output } \n`;
    context = vm.createContext(sandBox);
    script = new vm.Script(code);
    script.runInContext(context, {
      displayErrors: true,
      timeout: 1000
    });
    const solutionIsPassed = util.inspect(sandBox.solutionIsPassed);
    const solutionOutput = util.inspect(sandBox.solutionOutput);
    if (solutionIsPassed === 'true') countPassed++;
    if (countPassed === tests.length) isPassedAll = true;
    return {
      input: test.input,
      output: test.output,
      solutionOutput,
      solutionIsPassed,
    };
  });
  return { testResult, code, countPassed, isPassedAll };
}

module.exports = router;
