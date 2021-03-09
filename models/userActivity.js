const { Schema, model } = require("mongoose");

const userActivitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
    watched: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model("userActivity", userActivitySchema);
