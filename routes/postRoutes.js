import express from "express";

import authentication from "../middlewares/authentication.js";
import {
  uploadImage,
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postControllers.js";
import {
  like,
  unLike,
  addComment,
  deleteComment,
} from "../controllers/reviewsControllers.js";

const router = express.Router();

router.post("/upload-image", uploadImage);

router.route("/").get(getAllPosts).post(authentication, createPost);

router
  .route("/:id")
  .get(getPost)
  .put(authentication, updatePost)
  .delete(authentication, deletePost);

router
  .route("/:id/likes")
  .put(authentication, like)
  .delete(authentication, unLike);

router.put("/:id/comment", authentication, addComment);
router.delete("/:id/comment/:cid", authentication, deleteComment);

export default router;
