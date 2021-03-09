const { Router } = require("express");
const passport = require("../core/passport");
const StoryController = require("../controllers/story");

const route = Router();

route.get("/", passport.authenticate("jwt"), StoryController.getStories);
route.post("/", passport.authenticate("jwt"), StoryController.create);
route.put("/:storyId", passport.authenticate("jwt"), StoryController.watch);
route.get("/:storyId", StoryController.getById);

module.exports = route;
