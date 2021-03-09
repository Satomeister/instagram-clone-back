const { Schema, model } = require("mongoose");

const replySchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    usernameTo: {
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
  },
  { timestamps: true }
);

module.exports = model("reply", replySchema);
