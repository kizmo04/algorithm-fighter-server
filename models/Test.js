const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestSchema = new Schema({
  input: { type: String, required: true },
  expected_output: { type: String, required: true },
});

module.exports = TestSchema;
