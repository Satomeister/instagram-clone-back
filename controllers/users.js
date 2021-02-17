const User = require("../models/user");

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
      }).populate([
        {
          path: "followers",
          select: "_id fullname username avatar",
        },
        {
          path: "following",
          select: "_id fullname username avatar",
        },
      ]);

      return res.json({
        status: "success",
        data: user.toJSON(),
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async follow(req, res) {
    try {
      const authUserId = req.user._id;
      const candidate = await User.findOne({ _id: req.params.userId });

      if(candidate._id === authUserId) {
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

      return res.json({ status: "success", data: candidate.short() });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async unfollow(req, res) {
    try {
      const authUserId = req.user._id;
      const candidate = await User.findOne({ _id: req.params.userId });

      if(candidate._id === authUserId) {
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

      return res.json({ status: "success", data: candidate.short() });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }
}

module.exports = new UsersController();
