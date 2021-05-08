const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const errorController = require("./controllers/error");
const User = require("./models/user");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

require("./util/database");
const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/shop",
  collection: "sessions ",
});
const csrfPortection = csrf();
app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    store: store,
    name: "SID",
  })
);
app.use(
  flash()
); /*  app.use((err, req, res, next) => {
  console.log("kjhdkjjkmldmkl");
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  res.redirect("/");
});  */ //app.use(csrfPortection);
/* app.use(multer().single("image"));
 */ app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = "djdsjdsj";

  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use("/500", errorController.get500);

app.use((err, req, res, next) => {
  console.log(err);
  res.redirect("/500");
});
app.use(errorController.get404);

app.listen(3000, async () => {
  console.log("running");
});
