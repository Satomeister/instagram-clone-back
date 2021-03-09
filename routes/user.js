const { Router } = require("express");
const passport = require("../core/passport");
const UserController = require("../controllers/user");
const {
  register: registerValidation,
  editProfile: editProfileValidation,
} = require("../utils/validators");
const multer = require("../core/multer");

const route = Router();

route.post("/signup", registerValidation, UserController.create);
route.post("/login", UserController.login);
route.put("/logout", UserController.logout);
route.get("/me", passport.authenticate("jwt"), UserController.getMe);
route.put(
  "/edit",
  passport.authenticate("jwt"),
  editProfileValidation,
  UserController.edit
);
route.put(
  "/avatar/update",
  passport.authenticate("jwt"),
  multer.single("avatar"),
  UserController.updateAvatar
);
route.put(
  "/avatar/update",
  passport.authenticate("jwt"),
  multer.single("avatar"),
  UserController.updateAvatar
);
route.delete(
  "/avatar/delete",
  passport.authenticate("jwt"),
  UserController.deleteAvatar
);
route.get("/saved", passport.authenticate("jwt"), UserController.getSavedPosts);

route.post("/save", passport.authenticate("jwt"), UserController.savePost);
route.post("/unsave", passport.authenticate("jwt"), UserController.unSavePost);

module.exports = route;
