import BadRequestError from "../errors/bad-request.js";
import PostModel from "../models/Post.js";
import { checkReviewPermission } from "../utils/checkPermissions.js";

const like = async (req, res) => {
  const { id } = req.params;
  const { userId: user, name } = req.user;
  const post = await PostModel.findOne({ _id: id }, "likes");

  if (!post) {
    throw new NotFoundError(`No post with id ${id}`);
  }

  const likes = post.likes;
  const alreadyLiked = likes.find(
    (like) => like.user.toString() === user.toString()
  );

  if (alreadyLiked) {
    throw new BadRequestError("Post already liked.");
  }

  post.likes.push({ user, userName: name });
  await post.save();

  return res.status(200).json({ msg: "Liked the post successfully" });
};

const unLike = async (req, res) => {
  const { id } = req.params;
  const { userId: user, name } = req.user;
  const post = await PostModel.findOne({ _id: id }, "likes");

  if (!post) {
    throw new NotFoundError(`No post with id ${id}`);
  }

  const likes = post.likes;
  const updatedLikes = likes.filter(
    (like) => like.user.toString() !== user.toString()
  );
  post.likes = updatedLikes;
  await post.save();

  return res.status(200).json({ msg: "Unliked post successfully." });
};

const addComment = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const { userId: user, name } = req.user;
  const post = await PostModel.findOne({ _id: id }, "comments ");

  if (!post) {
    throw new NotFoundError(`No post with id ${id}`);
  }

  post.comments.push({ title, user, userName: name });
  await post.save();

  return res.status(200).json({ msg: "Added comment successfully." });
};

const deleteComment = async (req, res) => {
  const { id, cid } = req.params;
  const { userId: user } = req.user;

  const post = await PostModel.findOne({ _id: id }, "comments user");

  if (!post) {
    throw new NotFoundError(`No post with id ${id}`);
  }

  const comment = post.comments.find(
    (comment) => comment._id.toString() === cid
  );

  if (!comment) {
    throw new NotFoundError(`No comment with id ${cid}`);
  }

  checkReviewPermission({
    authUser: user,
    postUser: post.user,
    commentUser: comment.user,
  });

  const comments = post.comments;
  const updatedComments = comments.filter((comment) => {
    return comment._id.toString() !== cid;
  });
  post.comments = updatedComments;
  await post.save();

  return res.status(200).json({ msg: "Comment deleted successfully" });
};

export { like, unLike, addComment, deleteComment };
