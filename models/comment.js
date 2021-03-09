const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "reply",
      },
    ],
    repliesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = model("comment", commentSchema);
