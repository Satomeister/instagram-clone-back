const { Router } = require("express");
const passport = require("../core/passport");
const UsersController = require("../controllers/users");

const route = Router();

route.get("/", UsersController.index);
route.get('/:username', UsersController.getUser)
route.put('/follow/:userId', passport.authenticate("jwt"), UsersController.follow)
route.put('/unfollow/:userId', passport.authenticate("jwt"), UsersController.unfollow)


module.exports = route;
