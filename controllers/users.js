const User = require("../models/user");
const { user: userPopulate } = require("../utils/populates");

class UsersController {
  async index(req, res) {
    try {
      const value = req.query.user;
      if (value.trim()) {
        const users = await User.find({
          $or: [
            { username: new RegExp(value, "i") },
            { fullname: new RegExp(value, "i") },
          ],
        })
          .limit(30)
          .select("_id fullname username avatar");

        res.json({
          status: "success",
          data: users,
        });
      } else {
        res.json({
          status: "success",
          data: [],
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async getUser(req, res) {
    try {
      const user = await User.findOne({
        username: req.params.username,
      })
        .populate(userPopulate)
        .exec();

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      res.json({
        status: "success",
        data: user.toJSON(),
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async follow(req, res) {
    try {
      const authUserId = req.user._id;
      const candidate = await User.findOne({ _id: req.params.userId }).populate(
        {
          path: "story",
          populate: {
            path: "author",
            select: "fullname username avatar",
          },
        }
      );

      if (candidate._id === authUserId) {
        return res.status(400).json({
          status: "error",
        });
      }

      if (candidate.followers.includes(authUserId)) {
        return res.status(400).json({
          status: "error",
          error: "Already following",
        });
      } else {
        const authUser = await User.findOne(authUserId);
        authUser.following.push(candidate._id);
        candidate.followers.push(authUserId);
        await authUser.save();
        await candidate.save();
      }

      res.json({ status: "success", data: candidate.short() });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async unfollow(req, res) {
    try {
      const authUserId = req.user._id;
      const candidate = await User.findOne({ _id: req.params.userId }).populate(
        {
          path: "story",
          populate: {
            path: "author",
            select: "fullname username avatar",
          },
        }
      );

      if (candidate._id === authUserId) {
        return res.status(400).json({
          status: "error",
        });
      }

      if (!candidate.followers.includes(authUserId)) {
        return res.status(400).json({
          status: "error",
          error: "User is not following",
        });
      } else {
        const authUser = await User.findOne(authUserId);
        authUser.following = authUser.following.filter(
          (id) => id.toString() !== candidate._id.toString()
        );
        candidate.followers = candidate.followers.filter(
          (id) => id.toString() !== authUserId.toString()
        );
        await authUser.save();
        await candidate.save();
      }

      res.json({ status: "success", data: candidate.short() });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async getSuggestions(req, res) {
    try {
      const suggestions = await User.find({
        _id: { $ne: req.user._id },
        followers: { $ne: req.user._id },
      })
        .sort({ followers: -1 })
        .limit(5)
        .populate({
          path: "story",
          populate: {
            path: "author",
            select: "fullname username avatar date",
          },
        })
        .select("username fullname avatar story");

      res.json({
        status: "success",
        data: suggestions,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }
}

module.exports = new UsersController();
