const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  index: {
    type: Number,
    unique: 1,
  },
  file: {
    type: String,
  },
  name: {
    type: String,
  },
  content: {
    type: String,
  },
  link: {
    type: String,
  },
  cost: {
    type: Number,
  },
  submitted: {
    type: Array,
    default: [],
  },
  joined: {
    type: Array,
    default: [],
  },
});

const Project = mongoose.model("Project", projectSchema);

module.exports = { Project };
