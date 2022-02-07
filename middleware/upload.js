const multer = require("multer");
const fs = require("fs");
const path = require("path");

let upload = (req, res, next) => {
  try {
    fs.readdirSync("./uploads");
  } catch (err) {
    console.log("mkdir");
    fs.mkdirSync("./uploads");
  }

  const fileUpload = multer({
    storage: multer.diskStorage({
      destination(req, file, done) {
        done(null, `./uploads`);
      },
      filename(req, file, done) {
        // 파일 이름이 겹치는 걸 피하기 위해 파일 이름에 현재 시간 삽입
        const ext = path.extname(file.originalname);
        done(null, path.basename(file.originalname, ext) + Date.now() + ext);
      },
    }),
  });

  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });

    req.token = token;
    req.user = user;

    next();
  });
};

module.exports = { upload };
