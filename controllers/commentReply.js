const Reply = require("../models/reply");
const Comment = require("../models/comment");
const Post = require("../models/post");

class CommentReplyController {
  async getByCommentId(req, res) {
    try {
      const count = +req.query.count;
      const replies = await Comment.findById(req.params.commentId)
        .populate({
          path: "replies",
          options: { sort: { createdAt: -1 }, orderBy: -1 },
          skip: count,
          limit: +process.env.REPLIES_CHUNK,
          populate: {
            path: "author",
            populate: {
              path: "story",
              populate: {
                path: "author",
                select: "fullname username avatar date",
              },
            },
            select: "username fullname avatar story",
          },
        })
        .select("replies");

      res.json({
        status: "success",
        data: replies,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async create(req, res) {
    try {
      const data = {
        commentId: req.body.commentId,
        text: req.body.text,
        usernameTo: req.body.usernameTo,
        postId: req.body.postId,
        author: req.user._id,
      };

      let reply = await Reply.create(data);
      reply = await reply
        .populate("author", "username fullname avatar")
        .execPopulate();

      const comment = await Comment.findById(data.commentId);

      const post = await Post.findById(data.postId);

      if (!comment || !post) {
        res.status(400).send();
      }

      comment.replies.push(reply._id);
      comment.repliesCount += 1;
      post.commentsCount += 1;
      await post.save();
      await comment.save();

      res.json({
        status: "success",
        data: reply,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async like(req, res) {
    try {
      const reply = await Reply.findById(req.params.replyId);

      if (!reply) {
        res.status(400).send();
      }

      if (!reply.likes.includes(req.user._id)) {
        reply.likes.push(req.user._id);
        await reply.save();
      }

      res.json({
        status: "success",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async unLike(req, res) {
    try {
      const reply = await Reply.findById(req.params.replyId);

      if (!reply) {
        res.status(400).send();
      }

      reply.likes = reply.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );

      await reply.save();

      res.json({
        status: "success",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }
}

module.exports = new CommentReplyController();
