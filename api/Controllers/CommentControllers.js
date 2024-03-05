import Comment from "../Models/Comment.Model.js";
import { errorHandler } from "../utils/error.js";
const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId } = req.body;
    console.log({ content, postId, userId });
    if (userId !== req.user.id) {
      next(errorHandler(403, "You are not allowed to create this comment"));
    }
    const comment = await Comment.create({ postId, content, userId });
    res.status(200).json(comment);
  } catch (err) {
    next(err);
  }
};
const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: -1,
    });
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};
const likeComments = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    console.log(userIndex);
    if (userIndex === -1) {
      comment.numberOfLikes = comment.numberOfLikes + 1;
      comment.likes.push(req.user.id);
      console.log(userIndex);
    } else {
      comment.numberOfLikes = comment.numberOfLikes - 1;
      comment.likes.splice(userIndex, 1);
      console.log(userIndex);
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};
const editComments = async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);
  console.log(req.body);
  if (!comment) {
    return next(errorHandler(404, "Comment not Found"));
  }
  if (comment.userId !== req.user.id && !req.user.isAdmin) {
    return next(errorHandler(403, "You are no allowed to edit this comment"));
  }
  const editedComment = await Comment.findByIdAndUpdate(
    req.params.commentId,
    {
      content: req.body.content,
    },
    { new: true }
  );
  // editedComment.save();
  res.status(200).json(editedComment);
};
const deleteComments = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      next(errorHandler(404, "Comment not found"));
    }
    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to delete this comment")
      );
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json("Comment Deleted !");
  } catch (err) {
    next(err);
  }
};
const getAllComments = async (req, res, next) => {
  if (!req.user.isAdmin) {
    next(errorHandler(403, "You are not allowed to get all comments"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "desc" ? -1 : 1;
    const comments = await Comment.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalComments = await Comment.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthComments = await Comment.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({ comments, totalComments, lastMonthComments });
  } catch (err) {
    console.log(err);
  }
};
export {
  createComment,
  getPostComments,
  likeComments,
  editComments,
  deleteComments,
  getAllComments,
};
