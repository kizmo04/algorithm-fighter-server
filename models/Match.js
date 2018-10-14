const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MatchSchema = new Schema({
  users: { type: [{ type: Schema.Types.ObjectId, required: true }], validate: function(users) { return users.length === 2; } },
  winner_id: { type: Schema.Types.ObjectId, default: null },
  match_date: { type: Date, default: Date.now },
});

const Match = mongoose.model("Match", MatchSchema);

module.exports = Match;
