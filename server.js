const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");

const restaurants = require("./routes/restaurants");
const users = require("./routes/users");
const owners = require("./routes/owners");
const orders = require("./routes/orders");

const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var customCors = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,Cache-Control"
  );
  res.header("Access-Control-Allow-Credentials", true);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
};

app.use(customCors);
//db config
const db = require("./config/keys").mongoURI;

//Connect to mongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("mongoDB connected"))
  .catch(err => console.log(err));

app.use(passport.initialize());
//passport config
require("./config/passport.js")(passport);

app.listen(port, () => console.log(`Server running on port ${port}`));

app.use("/restaurant", restaurants);
app.use("/user", users);
app.use("/owner", owners);
app.use("/order", orders);
