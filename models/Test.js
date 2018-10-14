const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestSchema = new Schema({
  input: { type: String, required: true },
  expected_output: { type: String, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = TestSchema;
