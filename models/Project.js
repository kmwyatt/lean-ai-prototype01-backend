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

// userSchema.methods.comparePassword = function (plainPassword, callback) {
//   bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
//     if (err) return callback(err);
//     callback(null, isMatch);
//   });
// };

const Project = mongoose.model("Project", projectSchema);

module.exports = { Project };
