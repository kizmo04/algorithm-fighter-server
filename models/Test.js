const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestSchema = new Schema({
  code: String
});

module.exports = TestSchema;
