const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");
const UserActivity = require("../models/userActivity");

class CommentController {
  async getNewCommentsChunk(req, res) {
    try {
      const data = {
        postId: req.params.postId,
        count: +req.query.count,
      };

      const comments = await Post.findById(data.postId)
        .populate({
          path: "comments",
          options: { sort: { createdAt: -1 }, orderBy: -1 },
          skip: data.count,
          limit: process.env.COMMENTS_CHUNK,
          populate: { path: "author", select: "username fullname avatar" },
          select: "text author likes repliesCount createdAt",
        })
        .select("comments");

      res.json({
        status: "success",
        data: comments,
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
      const post = await Post.findById(req.params.postId);

      if (!post) {
        return res.status(400).json({
          status: "error",
          message: "Post not found",
        });
      }

      const commentData = {
        text: req.body.text,
        author: req.user._id,
      };

      let comment = await Comment.create(commentData);

      comment = await comment
        .populate([
          { path: "author", select: "fullname username avatar" },
          { path: "comments", populate: "replies" },
        ])
        .execPopulate();

      if (comment) {
        post.comments.push(comment);
        post.commentsCount += 1;
        const user = await User.findById(post.author._id);
        if (user && user._id !== req.user._id) {
          const activityData = {
            user: req.user._id,
            type: "comment",
            comment: comment._id,
            post: req.params.postId,
          };
          const activity = await UserActivity.create(activityData);
          user.activities.push(activity._id);
          user.unreadActivitiesCount += 1;
          await user.save();
        }
        await post.save();
      }

      res.json({
        status: "success",
        data: comment,
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
      const comment = await Comment.findById(req.params.commentId);

      if (!comment) {
        return res.status(400).json({
          status: "error",
          message: "Post not found",
        });
      }

      if (comment.likes.includes(req.user._id)) {
        return res.status(400).json({
          status: "error",
          message: "Comment already liked",
        });
      }

      comment.likes.push(req.user._id);
      comment.save();

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
      const comment = await Comment.findById(req.params.commentId);

      if (!comment) {
        return res.status(400).json({
          status: "error",
          message: "Post not found",
        });
      }

      comment.likes = comment.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );

      comment.save();

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

module.exports = new CommentController();
