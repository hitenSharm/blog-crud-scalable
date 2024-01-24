// models/Blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true, // Index for title field
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  views: {
    type: Number,
    default: 1,
    index: true, // Index for views field
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // Index for createdAt field
  },
  updatedAt: {
    type: Date,
  },
});

//middleware to update the 'updatedAt' field before saving
blogSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Created index for searching in title and content
blogSchema.index({ title: 'text', content: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
