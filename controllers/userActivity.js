const UserActivity = require("../models/userActivity");
const User = require("../models/user");

class UserActivityController {
  async index(req, res) {
    try {
      const user = await User.findById(req.user._id).populate({
        path: "activities",
        populate: [
          {
            path: "user",
            select: "fullname username avatar",
          },
          {
            path: "comment",
            select: "text",
          },
          {
            path: "post",
            select: "media",
          },
        ],
      });

      res.json({
        status: "success",
        data: user.activities,
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
      await UserActivity.updateMany(
        { _id: { $in: req.user.activities } },
        { watched: true }
      );

      await User.findByIdAndUpdate(req.user._id, { unreadActivitiesCount: 0 });

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

  async delete(req, res) {
    try {
      const user = await User.findById(req.user._id).populate(
        "activities",
        "watched"
      );
      await UserActivity.deleteMany({
        _id: { $in: user.activities.filter((a) => a.watched === true) },
      });
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

module.exports = new UserActivityController();
