import mongoose from "mongoose";

const commentsSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide the comment title"],
    trim: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
});

const likesSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const PostSchema = mongoose.Schema({
  image: {
    type: String,
    trim: true,
  },
  caption: {
    type: String,
    trim: true,
    required: [true, "Please provide the post caption"],
  },
  comments: {
    type: [commentsSchema],
  },
  likes: {
    type: [likesSchema],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide the user id."],
  },
});

const PostModel = mongoose.model("post", PostSchema);
export default PostModel;
