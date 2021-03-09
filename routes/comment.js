const { Router } = require("express");
const CommentController = require("../controllers/comment");
const passport = require("../core/passport");

const route = Router();

route.post("/:postId", passport.authenticate("jwt"), CommentController.create);
route.get("/:postId", CommentController.getNewCommentsChunk);
route.put(
  "/like/:commentId",
  passport.authenticate("jwt"),
  CommentController.like
);
route.put(
  "/unLike/:commentId",
  passport.authenticate("jwt"),
  CommentController.unLike
);

module.exports = route;
