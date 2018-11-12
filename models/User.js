const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SolutionSchema = require("./Solution");
const { EMAIL_REGEX } = require("./constants/regex");

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, match: EMAIL_REGEX },
    name: String,
    user_name: { type: String, default: "code worrior" },
    short_bio: String,
    profile_image_url: {
      type: String
    },
    solutions: [SolutionSchema]
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
