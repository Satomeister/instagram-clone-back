const jwt = require("jsonwebtoken");
const passport = require("../core/passport");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const cloudinary = require("../core/cloudinary");

class UserController {
  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        errors,
      });
    }

    const data = {
      fullname: req.body.fullname,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };

    const candidate = await User.findOne({
      $or: [{ username: data.username }, { email: data.email }],
    });
    if (candidate) {
      return res
        .status(400)
        .json({ status: "error", message: "Such user already exists" });
    }

    const user = await User.create(data);

    const userData = user.toJSON();

    return res.json({
      status: "success",
      data: {
        ...userData,
        token: jwt.sign({ data: user }, `'${process.env.JWT_SECRET}'`, {
          expiresIn: "7d",
        }),
      },
    });
  }

  async login(req, res, next) {
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      const userData = user.toJSON();

      return res.json({
        status: "success",
        data: {
          ...userData,
          token: jwt.sign({ data: user }, `'${process.env.JWT_SECRET}'`, {
            expiresIn: "7d",
          }),
        },
      });
    })(req, res, next);
  }

  async logout(req, res) {
    try {
      req.user = null;
      return res.json({ status: "success" });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async getMe(req, res) {
    try {
      const user = req.user.toJSON();
      return res.json({
        status: "success",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async edit(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          errors,
        });
      }

      const data = {
        fullname: req.body.fullname,
        username: req.body.username,
        email: req.body.email,
        bio: req.body.bio
      }

      const usernameCandidate = await User.findOne({_id: {$ne: req.user._id}, username: data.username});
      const emailCandidate = await User.findOne({_id: {$ne: req.user._id}, email: data.email});

      if (usernameCandidate) {
        return res.status(400).json({
          status: "error",
          message: 'Such username already taken'
        });
      }

      if (emailCandidate) {
        return res.status(400).json({
          status: "error",
          message: 'Such email already taken'
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { ...data },
        { new: true }
      );

      return res.json({
        status: "success",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error,
      });
    }
  }

  async updateAvatar(req, res) {
    try {
      const file = req.file;
      cloudinary.v2.uploader
        .upload_stream({ resource_type: "auto" }, async (error, result) => {
          if (error || !result) {
            return res.status(500).json({
              status: "error",
              message: error || "upload error",
            });
          }

          const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: result.url },
            { new: true }
          );

          return res.json({
            status: "success",
            data: user,
          });
        })
        .end(file.buffer);
    } catch (error) {
      return res.status(500).json({ status: "error", message: error });
    }
  }

  async deleteAvatar(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: "" },
        { new: true }
      );

      return res.json({
        status: "success",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error });
    }
  }
}

module.exports = new UserController();
