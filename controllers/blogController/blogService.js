const Blog = require("../../models/Blog");

const updateBlogViewCount = async (blogId, count) => {
    const result = await Blog.updateOne(
        { _id: blogId },
        { $inc: { views: count } }
    );
    //done like this for maintaining atomicity and prevent race conditions, can also add a version check
    //mongo supports optimistic locking
    return result;
}

module.exports={updateBlogViewCount}