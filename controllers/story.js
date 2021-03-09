const User = require("../models/user");
const Story = require("../models/story");

class StoryController {
  async getStories(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .populate({
          path: "following",
          populate: {
            path: "story",
            populate: {
              path: "author",
              select: "fullname username avatar date",
            },
          },
        })
        .select("following");

      const stories = [];

      user.following
        .filter((f) => f.story)
        .sort((a, b) => new Date(b.story.date) - new Date(a.story.date))
        .forEach((followingUser) => {
          if (followingUser.story) {
            stories.push(followingUser.story);
          }
        });

      res.json({
        status: "success",
        data: stories,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async getById(req, res) {
    try {
      const story = await Story.findById(req.params.storyId).populate(
        "author",
        "username fullname avatar"
      );

      if (!story) {
        return res.status(404).json({
          status: "error",
          message: "Story not fount",
        });
      }

      res.json({
        status: "success",
        data: story,
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
      const storyData = {
        video: req.body.video,
        author: req.user._id,
      };

      const user = await User.findById(storyData.author);

      const prevStory = user.story && user.story._id;

      const story = await Story.create(storyData);

      if (prevStory) {
        await Story.findOneAndDelete({ _id: prevStory });
      }

      user.story = story;
      await user.save();

      res.json({
        status: "success",
        data: story,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async watch(req, res) {
    try {
      const story = await Story.findById(req.params.storyId);

      if (!story.watchers.includes(req.user._id)) {
        story.watchers.push(req.user._id);
        story.save();
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

module.exports = new StoryController();
