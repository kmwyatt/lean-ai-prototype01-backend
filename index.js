const express = require("express");
const app = express();
const PORT = 4000;
const cookieParser = require("cookie-parser");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const multer = require("multer");
const fs = require("fs");
const path = require("path");

app.use("/img", express.static(path.join(__dirname, "./uploads")));

try {
  fs.readdirSync("./uploads");
} catch (err) {
  console.log("mkdir");
  fs.mkdirSync("./uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      callback(null, `./uploads`);
    },
    filename(req, file, callback) {
      // 파일 이름이 겹치는 걸 피하기 위해 파일 이름에 현재 시간 삽입
      const ext = path.extname(file.originalname);
      callback(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
});

const mongoose = require("mongoose");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");
const { Project } = require("./models/Project");
const { Work } = require("./models/Work");

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
    index: req.user.index,
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
  User.find({ role: { $gte: 1 } }, [], { sort: { index: -1 } }, (err, data) =>
    res.json(data)
  );
});

app.get("/api/admin/associatelist", (req, res) => {
  User.find({ role: 0 }, [], { sort: { index: -1 } }, (err, data) =>
    res.json(data)
  );
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
  Project.count({}, function (err, count) {
    const project = new Project({
      index: count + 1,
      file: req.file.filename,
      ...req.body,
    });
    project.save((err, projectInfo) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).json({
        success: true,
      });
    });
  });
});

// /api/project
app.post("/api/project/joinableproject", (req, res) => {
  console.log(req.body.userIndex);
  Project.find(
    {
      $and: [
        { submitted: { $not: { $all: [req.body.userIndex] } } },
        { joined: { $not: { $all: [req.body.userIndex] } } },
      ],
    },
    [],
    { sort: { index: -1 } },
    (err, data) => res.json(data)
  );
});

app.post("/api/project/submittedproject", (req, res) => {
  console.log(req.body.userIndex);
  Project.find(
    { submitted: req.body.userIndex },
    [],
    { sort: { index: -1 } },
    (err, data) => res.json(data)
  );
});

app.post("/api/project/joinedproject", (req, res) => {
  console.log(req.body.userIndex);
  Project.find(
    { joined: req.body.userIndex },
    [],
    { sort: { index: -1 } },
    (err, data) => res.json(data)
  );
});

app.post("/api/project/usersubmit", (req, res) => {
  Project.findOneAndUpdate(
    { index: req.body.projectIndex },
    { $push: { submitted: req.body.userIndex } },
    (err, data) =>
      res.status(200).json({
        success: true,
      })
  );
});

app.post("/api/project/userjoin", (req, res) => {
  Project.findOneAndUpdate(
    { index: req.body.projectIndex },
    {
      $pull: { submitted: req.body.userIndex },
      $push: { joined: req.body.userIndex },
    },
    (err, data) =>
      res.status(200).json({
        success: true,
      })
  );
});

app.post("/api/project/submitteduser", (req, res) => {
  console.log(req.body.projectIndex);
  Project.find({ index: req.body.projectIndex }, (err, data) => {
    console.log(data[0].submitted);
    User.find({ index: { $in: data[0].submitted } }, (err, data) => {
      res.json(data);
    });
  });
});

// /api/work
app.post("/api/work/uploadwork", upload.single("file"), (req, res) => {
  console.log("file!!", req.file);
  console.log("body!!!", req.body);
  Work.count({}, function (err, count) {
    const project = new Work({
      index: count + 1,
      file: req.file.filename,
      ...req.body,
    });
    project.save((err, workInfo) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).json({
        success: true,
      });
    });
  });
});

app.post("/api/work/uploaded", (req, res) => {
  console.log(req.body.projectIndex);
  Work.find(
    { project: req.body.projectIndex },
    [],
    { sort: { index: -1 } },
    (err, data) => {
      res.json(data);
    }
  );
});

app.post("/api/work/feedback", (req, res) => {
  Work.findOneAndUpdate({ index: req.body.index }, req.body, (err, data) =>
    res.status(200).json({
      success: true,
    })
  );
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
