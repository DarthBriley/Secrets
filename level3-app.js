//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const sha512 = require("js-sha512");

mongoose.connect(
  "mongodb+srv://" +
    process.env.mdbUser +
    ":" +
    process.env.mdbPass +
    "@cluster0.k1yyzyq.mongodb.net/userDB"
);

const userSchema = new mongoose.Schema({ email: String, password: String });
const User = mongoose.model("User", userSchema);

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", async function (req, res) {
  const foundUser = await User.findOne({
    email: req.body.username,
  }).exec();
  if (foundUser) {
    if (foundUser.password === sha512(req.body.password)) {
      res.render("secrets");
    } else {
      res.send("Password is wrong for " + req.body.username + ".");
    }
  } else {
    res.send("Email Not found : " + req.body.username + ".");
  }
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: sha512(req.body.password),
  });
  await newUser
    .save()
    .then(() => {
      res.render("secrets");
    })
    .catch((err) => {
      res.send("Error saving ", req.body.username, " article: ", err);
    });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
