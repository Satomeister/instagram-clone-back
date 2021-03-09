const { Router } = require("express");
const UserActivityController = require("../controllers/userActivity");
const passport = require("../core/passport");

const route = Router();

route.get("/", passport.authenticate("jwt"), UserActivityController.index);
route.put("/", passport.authenticate("jwt"), UserActivityController.watch);
route.delete("/", passport.authenticate("jwt"), UserActivityController.delete);

module.exports = route;
