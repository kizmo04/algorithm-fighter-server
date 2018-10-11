const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SolutionSchema = require("./Solution");

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ },
  name: String,
  user_name: { type: String, default: "code worrior" },
  joined_date: { type: Date, default: Date.now },
  short_bio: String,
  profile_image_url: {
    type: String
    // get: v => `${global}${v}`
  },
  solutions: [SolutionSchema]
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
