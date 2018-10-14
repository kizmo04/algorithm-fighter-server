const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const mongoose = require('mongoose');
const {
  ServerError,
  InvalidMatchIdError,
  InvalidWinnerIdError,
  InvalidMatchUsersError,
  DuplicateObjectIdError,
} = require('../lib/errors');

router.get('/', (req, res, next) => {
  Match.find()
  .then(matches => {
    res.status(200).json(matches);
  })
  .catch(err => {
    next(new ServerError());
  });
});

router.post('/', (req, res, next) => {
  const { host_id, guest_id } = req.body;

  if ( !mongoose.Types.ObjectId.isValid(host_id) || !mongoose.Types.ObjectId.isValid(guest_id)) {
    next(new InvalidMatchUsersError());
  } else if (host_id === guest_id) {
    next(new DuplicateObjectIdError());
  }

  const newMatch = new Match({
    users: [ host_id, guest_id ],
  });

  newMatch.save()
  .then(match => {
    res.status(201).json(match);
  })
  .catch(err => {
    next(new ServerError());
  });
});

router.put('/:match_id', (req, res, next) => {
  const { match_id } = req.params;
  const { winner_id } = req.body;

  if (!mongoose.Types.ObjectId.isValid(match_id)) {
    next(new InvalidMatchIdError());
  } else if (!mongoose.Types.ObjectId.isValid(winner_id)) {
    next(new InvalidWinnerIdError());
  }

  Match.findByIdAndUpdate(match_id, { winner_id })
  .then(match => {
    res.status(200).json(match);
  })
  .catch(err => {
    next(new ServerError());
  });
});

module.exports = router;
