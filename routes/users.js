const { Router } = require("express");
const passport = require("../core/passport");
const UsersController = require("../controllers/users");

const route = Router();

route.get("/", UsersController.index);
route.put(
  "/follow/:userId",
  passport.authenticate("jwt"),
  UsersController.follow
);
route.put(
  "/unfollow/:userId",
  passport.authenticate("jwt"),
  UsersController.unfollow
);
route.get(
  "/suggestions",
  passport.authenticate("jwt"),
  UsersController.getSuggestions
);
route.get("/:username", UsersController.getUser);

module.exports = route;
