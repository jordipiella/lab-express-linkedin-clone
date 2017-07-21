const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  email: String,
  name: String,
  password: String,
  summary: String,
  imageUrl: String,
  company: String,
  posts: [],
  followers: [],
  jobTitle: String,
  facebookID: String,
  googleID: String,
  linkedinID: String
}, {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  });

const User = mongoose.model("User", userSchema);

module.exports = User;
