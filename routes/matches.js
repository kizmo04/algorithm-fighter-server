const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const {
  ServerError,
} = require('../lib/errors');

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', (req, res, next) => {
  const { hostUserId, guestUserId } = req.body;
  const newMatch = new Match({
    users: [ hostUserId, guestUserId ],
  });

  newMatch.save((err, match) => {
    if (err) {
      next(new ServerError());
    }
    res.status(201).json(match);
  });
});

router.put('/:match_id', (req, res, next) => {
  const { match_id } = req.params;
  const { winner_id } = req.body;

  Match.findByIdAndUpdate(match_id, { winner_id })
  .then(match => {
    res.status(200).json(match);
  })
  .catch(err => {
    next(new ServerError());
  });

});

module.exports = router;
