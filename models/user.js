const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },

  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  notifications: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Notification" },
  ],

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  sentFollowRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  biography: { type: String },
  imagePath: { type: String },
  isPrivate: { type: Boolean, default: true },
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
