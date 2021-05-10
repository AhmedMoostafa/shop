const fs = require("fs");

const deletFile = (path) => {
  if (fs.existsSync(path)) {
    fs.unlink(path, (err) => {
      if (err) throw err;
    });
  }
};

module.exports = deletFile;
