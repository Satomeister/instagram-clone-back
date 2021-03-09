const { Schema, model } = require("mongoose");
// lower case
const StorySchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  video: {
    type: String,
    required: true,
  },
  watchers: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  date: {
    type: Date,
    default: Date.now(),
  },
  expireAt: {
    type: Date,
    default: new Date(new Date().getTime() + 86400000),
    required: true,
  },
});

StorySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model("story", StorySchema);
