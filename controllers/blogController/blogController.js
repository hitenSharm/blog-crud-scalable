const { default: mongoose } = require("mongoose");
const Blog = require("../../models/Blog");
const { atLeastOneNotEmpty, allNonEmpty } = require("../../utils/fieldValidator");
const { updateBlogViewCount } = require("./blogService");
const { getInCache, setInCache, increaseKeyValue, deleteInCache } = require("../../cachingLayer/redisClient");
const { checkDbForRec } = require("../../queues/queueServices");
const { deleteRecommendation } = require("../recommendation");


const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    //validation
    if (!allNonEmpty(title, content)) {
      return res.status(400).json({ error: 'All parameters must be non-empty' });
    }

    const newBlog = new Blog({ title, content, author: req.userId });
    await newBlog.save();
    res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ blogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//this above is mainly for testing

const getBlogById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.blogId)) {
    return res.status(404).json({ message: 'Blog not found' });
  }

  try {

    let blog = await getInCache(`blogId ${req.params.blogId}`);
    let cacheKeyCount = "view " + req.params.blogId;


    if (blog) {
      console.log("Cache hit");
      //cache hit;
      //change view+blogId key           
      await increaseKeyValue(cacheKeyCount);
      return res.json({ blog });
    }


    blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    updateBlogViewCount(req.params.blogId, 1);

    checkDbForRec(req.params.blogId);    

    //set count and blog in cache
    setInCache(`blogId ${req.params.blogId}`, blog, 100);
    setInCache(cacheKeyCount, 1, 113);
    console.log("set in cache both");

    res.json({ blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!atLeastOneNotEmpty(title, content)) {
      return res.status(400).json({ error: 'At least one parameter must be non-empty' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.blogId,
      { title, content },
      { new: true } // Return the updated document
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    let cacheKeyCount = "view " + req.params.blogId;
    setInCache(`blogId ${req.params.blogId}`, updatedBlog, 100);
    setInCache(cacheKeyCount, 1, 113);

    res.json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.blogId);

    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    deleteInCache(`blogId ${req.params.blogId}`);
    deleteRecommendation(req.params.blogId);
    //dont really need to wait for it to delete

    res.json({ message: 'Blog deleted successfully', blog: deletedBlog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//advanced enddpoints---------------------------------------------

const getLatestNBlogs = async (req, res) => {
  try {
    const { count } = req.query;

    if (!allNonEmpty(count)) {
      return res.status(400).json({ error: 'All parameters must be non-empty' });
    }

    const latestBlogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(count));

    res.json({ blogs: latestBlogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchBlogs = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!allNonEmpty(keyword)) {
      return res.status(400).json({ error: 'Keyword is required for search' });
    }

    const searchResults = await Blog.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } }, // Case-insensitive 
        { content: { $regex: keyword, $options: 'i' } }, // Case-insensitive
      ],
    });

    res.json({ blogs: searchResults });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMostPopularBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    //this is paginated with some default values    
    const skip = (page - 1) * limit;

    const mostPopularBlogs = await Blog.find()
      .sort({ views: -1 }) // Sort descending order
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ blogs: mostPopularBlogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBlogRecommendation = async (req, res) => {
  let viewedBlogId = req.params.blogId;
  let recs = await checkDbForRec(viewedBlogId);
  return res.json(recs);
}

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getLatestNBlogs,
  searchBlogs,
  getMostPopularBlogs,
  getBlogRecommendation
};