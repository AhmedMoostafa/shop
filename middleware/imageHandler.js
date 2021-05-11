const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./images";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error("please upload jpg or png or jpeg "));
  }
  cb(undefined, true);
};
const prodImage = multer({ storage, fileFilter }).single("image");

module.exports = prodImage;
