const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const mongoose = require('mongoose');
const {
  ServerError,
  InvalidParameterError,
} = require('../lib/errors');
const checkAuth = require('../middleware/check-auth');

router.use(checkAuth);

router.get('/', (req, res, next) => {
  Match.find() // winner_id null은 제외...
  .then(matches => {
    res.status(200).json(matches);
  })
  .catch(err => next(new ServerError()));
});

router.post('/', (req, res, next) => {
  const { host_id, guest_id } = req.body;

  if ( !mongoose.Types.ObjectId.isValid(host_id) || !mongoose.Types.ObjectId.isValid(guest_id) || host_id === guest_id) {
    next(new InvalidParameterError('user id'));
    return;
  }

  const newMatch = new Match({
    users: [ host_id, guest_id ],
  });

  newMatch.save()
  .then(match => {
    res.status(201).json(match);
  })
  .catch(err => next(new ServerError()));
});

router.put('/:match_id', (req, res, next) => {
  const { match_id } = req.params;
  const { winner_id } = req.body;

  if (!mongoose.Types.ObjectId.isValid(match_id)) {
    next(new InvalidParameterError('match id'));
    return;
  } else if (!mongoose.Types.ObjectId.isValid(winner_id)) {
    next(new InvalidParameterError('winner id'));
    return;
  }

  Match.findByIdAndUpdate(match_id, { winner_id })
  .then(match => {
    res.status(200).json(match);
  })
  .catch(err => next(new ServerError()));
});

module.exports = router;
