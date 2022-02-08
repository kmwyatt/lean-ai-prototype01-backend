const mongoose = require("mongoose");

const workSchema = new mongoose.Schema({
  index: {
    type: Number,
    unique: 1,
  },
  project: {
    type: Number,
  },
  writerIndex: {
    type: Number,
  },
  writerId: {
    type: String,
  },
  text: {
    type: String,
  },
  file: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  feedback: {
    type: Number,
    default: 0,
  },
  manager: {
    type: Number,
  },
  comment: {
    type: String,
  },
});

const Work = mongoose.model("Work", workSchema);

module.exports = { Work };
