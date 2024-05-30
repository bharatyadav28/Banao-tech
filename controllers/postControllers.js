import path from "path";

import { BadRequestError, NotFoundError } from "../errors/index.js";
import PostModel from "../models/Post.js";
import getCurrentDirectory from "../utils/currentDirectory.js";
import { checkPostPermissions } from "../utils/index.js";

const uploadImage = (req, res) => {
  const file = req.files;
  const __dirname = getCurrentDirectory(import.meta.url);

  if (!file) {
    throw new BadRequestError("Please upload a file.");
  }

  const postImage = req.files.image;

  if (!postImage.mimetype.startsWith("image")) {
    throw new BadRequestError("Only image file is supported.");
  }

  postImage.mv(path.join(__dirname, "../public/images", postImage.name));

  const relativePath = path.join("images", postImage.name);

  return res.status(200).json({ image: { path: relativePath } });
};

const getAllPosts = async (req, res) => {
  const posts = await PostModel.find();
  return res.status(200).json({ posts, count: posts.length });
};

const createPost = async (req, res) => {
  const incomingData = req.body;
  const user = req.user.userId;

  const newPostData = { ...incomingData, user };
  const post = await PostModel.create(newPostData);

  return res.status(200).json({ msg: "Post created successfully" });
};

const getPost = async (req, res) => {
  const postId = req.params.id;
  const post = await PostModel.findOne({ _id: postId });
  if (!post) {
    throw new NotFoundError(`No post with id ${postId}.`);
  }

  const nLikes = post.likes.length;
  const nComments = post.comments.length;

  return res.status(200).json({ post, nLikes, nComments });
};

const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { image, caption } = req.body;

  const post = await PostModel.findOne({ _id: postId });

  if (!post) {
    throw new NotFoundError(`No post with id ${postId}`);
  }

  checkPostPermissions({ authUser: req.user.userId, resourceUser: post.user });

  post.image = image;
  post.caption = caption;
  await post.save();

  return res.status(200).json({ msg: "Post updated successfully" });
};

const deletePost = async (req, res) => {
  const postId = req.params.id;

  const post = await PostModel.findOne({ _id: postId });
  if (!post) {
    throw new NotFoundError(`No post with id ${postId}`);
  }

  checkPostPermissions({ authUser: req.user.userId, resourceUser: post.user });

  await PostModel.findOneAndDelete({ _id: postId });

  return res.status(200).json({ msg: "Post deleted successfully." });
};

export {
  uploadImage,
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
