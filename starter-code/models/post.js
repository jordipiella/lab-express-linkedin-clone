const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../models/user');

const userSchema = new Schema({
  title: String,
  description: String,
  picture: String,
  author: {
    id: String,
    name: String,
    imageUrl: String
  }
}, {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  });

const Post = mongoose.model("Post", userSchema);

module.exports = Post;
