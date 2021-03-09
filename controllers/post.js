const Post = require("../models/post");
const User = require("../models/user");
const UserActivity = require("../models/userActivity");

class PostController {
  async getPosts(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .populate({
          path: "following",
          populate: {
            path: "posts",
            options: { sort: { createdAt: -1 }, orderBy: -1 },
            limit: 5,
            populate: [
              {
                path: "author",
                populate: {
                  path: "story",
                  populate: {
                    path: "author",
                    select: "fullname username avatar",
                  },
                },
                select: "fullname username avatar",
              },
              {
                path: "comments",
                options: { sort: { createdAt: -1 }, orderBy: -1 },
                limit: 2,
                populate: {
                  path: "author",
                  select: "username fullname avatar",
                },
                select: "text author likes",
              },
            ],
          },
        })
        .select("following");

      const posts = [];

      user.following.forEach((followingUser) => {
        posts.push(...followingUser.posts);
      });

      res.json({
        status: "success",
        data: posts.slice(0, process.env.POSTS_CHUNK),
      });
    } catch (error) {
      res.status(500).json({
        status: "500",
        error,
      });
    }
  }

  async create(req, res) {
    try {
      const postData = {
        media: req.body.media,
        description: req.body.description,
        author: req.user._id,
      };

      if (!postData.media.length) {
        return res.status(400).send();
      }

      let post = await Post.create(postData);

      post = await post
        .populate([
          {
            path: "author",
            populate: {
              path: "story",
              populate: {
                path: "author",
                select: "fullname username avatar",
              },
            },
            select: "fullname username avatar story",
          },
          {
            path: "comments",
            options: { sort: { createdAt: -1 }, orderBy: -1 },
            limit: process.env.COMMENTS_CHUNK,
            populate: {
              path: "author",
              select: "username fullname avatar",
            },
            select: "text author likes repliesCount createdAt",
          },
        ])
        .execPopulate();

      const user = await User.findById(req.user._id);

      user.posts.push(post._id);

      await user.save();

      res.json({
        status: "success",
        data: {
          shortPost: {
            _id: post._id,
            media: post.media,
            likesCount: 0,
            commentsCount: 0,
          },
          post,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async getPostById(req, res) {
    try {
      let commentsCountWithoutReplies;
      let post = await Post.findById(req.params.postId);
      commentsCountWithoutReplies = post.comments.length;
      await post
        .populate([
          {
            path: "author",
            populate: {
              path: "story",
              populate: {
                path: "author",
                select: "fullname username avatar",
              },
            },
            select: "fullname username avatar story",
          },
          {
            path: "comments",
            options: { sort: { createdAt: -1 }, orderBy: -1 },
            limit: process.env.COMMENTS_CHUNK,
            populate: {
              path: "author",
              select: "username fullname avatar",
            },
            select: "text author likes repliesCount createdAt",
          },
        ])
        .execPopulate();

      if (!post) {
        return res.status(404).json({
          status: "error",
          message: "Post Not Fount",
        });
      }

      res.json({
        status: "success",
        data: { post, commentsCountWithoutReplies },
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
      const post = await Post.findById(req.params.postId);

      if (!post) {
        return res.status(400).json({
          status: "error",
          message: "Post not found",
        });
      }

      if (!post.likes.includes(req.user._id)) {
        post.likes.push(req.user._id);
        post.likesCount += 1;
        const user = await User.findById(post.author._id);
        if (user && user._id !== req.user._id) {
          const activityData = {
            user: req.user._id,
            type: "like",
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
      const post = await Post.findById(req.params.postId);

      if (!post) {
        return res.status(400).json({
          status: "error",
          message: "Post not found",
        });
      }

      if (post.likes.includes(req.user._id)) {
        post.likes = post.likes.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
        post.likesCount -= 1;
        const user = await User.findById(post.author._id);
        if (user && user._id !== req.user._id) {
          const activity = await UserActivity.findOneAndDelete({
            user: req.user._id,
            post: req.params.postId,
          });
          user.activities = user.activities.filter((id) => id !== activity._id);
          user.unreadActivitiesCount -= 1;
          await user.save();
        }
        await post.save();
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
}

module.exports = new PostController();
