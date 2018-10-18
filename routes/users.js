const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Problem = require('../models/Problem');
const Match = require('../models/Match');
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
        try {
          const result = checkSolution(code, tests);
          cb(null, result);
        } catch (error) {
          console.log(error);
          cb(new ServerError());
        }
      },
      (result, cb) => {
        try {
          const { testResult, code, countPassed, isPassedAll } = result;

          if (isPassedAll) {
            Promise.all([
              Problem.findOneAndUpdate({ _id: problem_id }, { $addToSet: { completed_from: user_id }}),
              User.findByIdAndUpdate(user_id, { $addToSet: { solutions: { problem_id, code} }}),
            ])
            .then(() => {
              cb(null, { testResult, countPassed, isPassedAll });
            })
            .catch(err => cb(new ServerError()));
          } else {
            cb(null, { testResult, countPassed, isPassedAll });
          }
        } catch (error) {
          cb(new ServerError());
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

router.get('/:user_id/matches', (req, res, next) => {
  const { user_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    next(new InvalidParameterError('user id'));
    return;
  }

  async.waterfall([
    cb => {
      Match.find({ $and: [ { users: { $in: [user_id] } }, { winner_id: { $not: { $in: [null] } } } ] })
      .then(matches => {
        cb(null, matches);
      })
      .catch(err => cb(new ServerError()));
    },
    (matches, cb) => {
      async.map(matches,
        (match, secondCb) => {
          const partnerId = match.users[0].toString() === user_id ? match.users[1] : match.users[0];
          Promise.all([
            User.findById(match.winner_id),
            User.findById(partnerId)
          ])
          .then(([winner, partner]) => {
            const newMatch = {
              created_at: match.created_at,
              winner: winner.email,
              partner: partner.email,
            };
            secondCb(null, newMatch);
          })
          .catch(err => {
            secondCb(err);
          });
        },
        (err, matches) => {
          if (err) {
            cb(new ServerError());
            return;
          }
          cb(null, matches);
        }
      );
    }
  ],
    (err, matches) => {
      if (err) {
        next(new ServerError());
        return;
      }
      res.status(200).json(matches);
  });
});

router.get('/:user_id/solutions', (req, res, next) => {
  const { user_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    next(new InvalidParameterError('user id'));
    return;
  }

  async.waterfall([
    cb => {
      User.findById(user_id)
      .then(user => {
        if (user) {
          cb(null, user.solutions);
        } else {
          cb(new InvalidParameterError('user id'));
        }
      })
      .catch(err => cb(err));
    },
    (solutions, cb) => {
      async.map(solutions,
        (solution, secondCb) => {
          Problem.findById(solution.problem_id)
          .then(problem => {
            if (!problem) {
              cb(new InvalidParameterError('problem id'));
              return;
            }
            const newSolution = {
              code: solution.code,
              _id: solution._id,
              problem_title: problem.title,
              problem_id: problem._id,
              problem_description: problem.description,
              created_at: solution.created_at,
            }
            secondCb(null, newSolution);
          })
          .catch(err => {
            secondCb(err);
          });
        },
        (err, solutions) => {
          if (err) {
            cb(new ServerError());
            return;
          }
          cb(null, solutions);
        }
      );
    }
  ],
    (err, solutions) => {
      if (err) {
        next(new ServerError());
        return;
      }
      res.status(200).json(solutions);
  });
});

function checkSolution (code, tests) {
  let sandBox;
  let script;
  let context;
  let countPassed = 0;
  let isPassedAll = false;

  let testResult = tests.map(test => {
    sandBox = {
      actual: null,
      isPass: null,
    };
    let codeToCheck = code + 'actual = ' + `\nactual = solution(${ test.input })` +  `\nisPass = actual === ${test.expected_output} ? true : false \n`;
    // console.log('code To check', eval(codeToCheck));
    context = vm.createContext(sandBox);
    script = new vm.Script(codeToCheck);
    script.runInContext(context, {
      displayErrors: true,
      timeout: 1000
    });
    const pass = JSON.parse(util.inspect(sandBox.isPass));
    const solutionOutput = util.inspect(sandBox.actual);
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
