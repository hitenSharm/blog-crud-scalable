const Blog = require("../../models/Blog");
const { preprocessText, calculateSimilarity } = require("../../utils/nlp");

const updateBlogViewCount = async (blogId, count) => {
    const result = await Blog.updateOne(
        { _id: blogId },
        { $inc: { views: count } }
    );
    //done like this for maintaining atomicity and prevent race conditions, can also add a version check
    //mongo supports optimistic locking
    return result;
}

const generateReccomendations = async (blogId, viewedBlog) => {
    //generate 5 reccomendations
    const N = 5;
    try {
        const preprocessedViewedPost = preprocessText(viewedBlog.content);

        const allPosts = await Blog.find({ _id: { $ne: blogId } });
        const similarityScores = allPosts.map(blog => ({
            blogId: blog._id,
            similarity: calculateSimilarity(preprocessedViewedPost, preprocessText(blog.content))
        }));

        // Sort the posts based on similarity scores in descending order
        similarityScores.sort((a, b) => b.similarity - a.similarity);

        // Get the top N most similar posts
        const recommendedPosts = similarityScores.slice(0, Math.min(N,allPosts.length)); 
        console.log("did processing");       
        
        return recommendedPosts;
    } catch (error) {
        console.error("error");
    }
}

module.exports = { updateBlogViewCount, generateReccomendations }