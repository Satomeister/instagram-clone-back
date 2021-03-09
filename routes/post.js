const { Router } = require("express");
const PostController = require("../controllers/post");
const passport = require("../core/passport");

const route = Router();

route.post("/", passport.authenticate("jwt"), PostController.create);
route.get("/", passport.authenticate("jwt"), PostController.getPosts);
route.put("/like/:postId", passport.authenticate("jwt"), PostController.like);
route.put(
  "/unlike/:postId",
  passport.authenticate("jwt"),
  PostController.unLike
);
route.get("/:postId", PostController.getPostById);

module.exports = route;
