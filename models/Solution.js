const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SolutionSchema = new Schema({
  problem_id: { type: Schema.Types.ObjectId, required: true },
  code: String
});

module.exports = SolutionSchema;