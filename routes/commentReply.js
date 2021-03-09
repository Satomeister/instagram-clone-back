const { Router } = require("express");
const CommentReplyController = require("../controllers/commentReply");
const passport = require("../core/passport");

const route = Router();

route.get("/:commentId", CommentReplyController.getByCommentId);
route.post("/", passport.authenticate("jwt"), CommentReplyController.create);
route.put(
  "/like/:replyId",
  passport.authenticate("jwt"),
  CommentReplyController.like
);
route.put(
  "/unLike/:replyId",
  passport.authenticate("jwt"),
  CommentReplyController.unLike
);

module.exports = route;
