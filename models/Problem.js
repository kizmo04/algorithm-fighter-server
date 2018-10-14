const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TestSchema = require("./Test");

const ProblemSchema = new Schema({
  title: { type: String, required: true, trim: true, validate: validateTitle },
  description: String,
  difficulty_level: { type: Number, required: true },
  created_from: { type: Schema.Types.ObjectId, required: true },
  completed_from: [Schema.Types.ObjectId],
  initial_code: String,
  tests: { type: [TestSchema], required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const Problem = mongoose.model("Problem", ProblemSchema);

function validateTitle(title) {
  return title.trim().length > 0;
}

module.exports = Problem;
