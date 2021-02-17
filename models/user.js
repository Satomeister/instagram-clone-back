const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: String,
  bio: String,
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  saved: [
    {
      type: Schema.Types.ObjectId,
      ref: "post",
      default: []
    },
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: []
    },
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: []
    },
  ],
});

UserSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  return await bcrypt.compare(password, user.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

UserSchema.methods.short = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.followers;
  delete obj.following;
  delete obj.saved;
  delete obj.posts
  delete obj.bio;
  delete obj.email
  return obj;
};

module.exports = model("user", UserSchema);
