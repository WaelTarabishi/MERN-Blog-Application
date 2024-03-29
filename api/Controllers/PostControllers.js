//@desc  Create a post
//route POST /api/post/create
//@access Private(Only Admin)
import { errorHandler } from "../utils/error.js";
import Post from "../Models/Post.Model.js";
const createPost = async (req, res, next) => {
  // console.log(req.body.title);
  const { title } = req.body;

  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to create a Post"));
  }

  const postTitleExist = await Post.findOne({ title });

  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }

  if (postTitleExist) {
    return next(errorHandler(403, "This Title is Exist"));
  }

  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "-");
  // console.log(slug);
  const post = await Post.create({ ...req.body, userId: req.user._id, slug });
  if (post) {
    res.status(200).json({
      userId: post.userId,
      image: post.image,
      title: post.title,
      content: post.content,
      slug: post.slug,
      category: post.category,
    });
    // console.log(post.slug);
  } else {
    next(errorHandler(400, "Invalid Data"));
  }
};
const getPosts = async (req, res, next) => {
  try {
    // console.log(req.query);
    // console.log(req);
    // console.log(req.query.startIndex);
    console.log(req.query);
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    console.log(posts);
    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};
const deletePosts = async (req, res, next) => {
  // console.log(user.query);
  // console.log(user);
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    next(errorHandler(403, "You are not allowed to delete this post"));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json("The Post has been deleted");
  } catch (err) {
    next(err);
  }
};
const updatePost = async (req, res, next) => {
  console.log("start updating");
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    next(errorHandler(403, "You are not allowed to delete this post"));
  }
  try {
    const slug = req.body.title
      .split(" ")
      .join("-")
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-");
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
          slug,
        },
      },
      { new: true }
    );
    updatedPost.save();
    res.status(200).json(updatedPost);
  } catch (err) {
    next(err);
  }
};

export { createPost, getPosts, deletePosts, updatePost };
