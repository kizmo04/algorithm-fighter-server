const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SolutionSchema = new Schema({
  problem_id: { type: Schema.Types.ObjectId, required: true },
  code: { type: String, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = SolutionSchema;