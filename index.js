const express = require("express");
const app = express();
const PORT = 4000;
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const multer = require("multer");
const fs = require("fs");
const path = require("path");

try {
  fs.readdirSync("./public/uploads");
} catch (err) {
  console.log("mkdir");
  fs.mkdirSync("./public/uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, `./public/uploads`);
    },
    // filename(req, file, done) {
    //   // 파일 이름이 겹치는 걸 피하기 위해 파일 이름에 현재 시간 삽입
    //   const ext = path.extname(file.originalname);
    //   done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    // },
    filename(req, file, done) {
      done(null, file.originalname);
    },
  }),
});

const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://kmwyatt:abcd1234@cluster0.ke6dw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected..."))
  .catch((error) => console.log("error!!!", error));

app.get("/", (req, res) => res.send("Hello World !"));

app.get("/api/hello", (req, res) => {
  res.send("Hello !!!");
});

// /api/users
app.post("/api/users/register", (req, res) => {
  User.count({}, function (err, count) {
    const user = new User({
      index: count + 1,
      ...req.body,
    });
    user.save((err, userInfo) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).json({
        success: true,
      });
    });
  });
});

app.post("/api/users/login", (req, res) => {
  User.findOne({ id: req.body.id }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "요청한 아이디에 해당하는 유저가 없습니다.",
      });
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.get("/api/users/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAuth: true,
    id: req.user.id,
    name: req.user.name,
    phoneNumber: req.user.phoneNumber,
    email: req.user.email,
    role: req.user.role,
    point: req.user.point,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

// /api/admin
app.get("/api/admin/memberlist", (req, res) => {
  User.find({ role: { $gte: 1 } }, (err, data) => res.json(data));
});

app.get("/api/admin/associatelist", (req, res) => {
  User.find({ role: 0 }, (err, data) => res.json(data));
});

app.post("/api/admin/levelup", (req, res) => {
  User.findOneAndUpdate({ id: req.body.id }, { role: 1 }, (err, data) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/admin/createproject", upload.single("file"), (req, res) => {
  console.log("file!!", req.file);
  console.log("body!!!", req.body);
  User.count({}, function (err, count) {
    console.log("Number of users:", count);
  });
  res.status(200);
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
