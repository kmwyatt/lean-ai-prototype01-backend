const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    minlength: 4,
    maxlength: 20,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  name: {
    type: String,
    maxlength: 10,
  },
  phoneNumber: {
    type: String,
    unique: 1,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  role: {
    type: Number,
    default: 0,
  },
  point: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
  },
});

userSchema.pre("save", function (next) {
  const user = this;

  if (user.isModified("password")) {
    // 비밀번호를 암호화
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);

        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, callback) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

userSchema.methods.generateToken = function (callback) {
  const user = this;

  const token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  user.save(function (err, user) {
    if (err) return callback(err);
    callback(null, user);
  });
};

userSchema.statics.findByToken = function (token, callback) {
  const user = this;

  jwt.verify(token, "secretToken", function (err, decoded) {
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return callback(err);
      callback(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
