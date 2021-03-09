const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./core/db");
const passport = require("./core/passport");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

const authUserRoute = require("./routes/user");
const usersRoute = require("./routes/users");
const postRoute = require("./routes/post");
const commentRoute = require("./routes/comment");
const commentReplyRoute = require("./routes/commentReply");
const storyRoute = require("./routes/story");
const userActivity = require("./routes/userActivity");
const fileRoute = require("./routes/file");

app.use("/user", authUserRoute);
app.use("/users", usersRoute);
app.use("/post", postRoute);
app.use("/comment", commentRoute);
app.use("/reply", commentReplyRoute);
app.use("/story", storyRoute);
app.use("/activity", userActivity);
app.use("/file", fileRoute);

app.listen(process.env.PORT || 3001, () => {
  console.log(`${process.env.PORT || 3001} running`);
});
