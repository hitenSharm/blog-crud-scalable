const Bull = require("bull");
const Blog = require("../models/Blog");
const { generateReccomendations } = require("../controllers/blogController/blogService");
const { saveRecommendation } = require("../controllers/recommendation");

const queue = new Bull('recommendations');

queue.process('generate-recommendations', async ({ data: { viewedBlogId } }) => {
    try {
        const viewedBlog = await Blog.findById(viewedBlogId);
        const recommendedBlogs = await generateReccomendations(viewedBlogId, viewedBlog);        
        let res = await saveRecommendation(viewedBlogId, recommendedBlogs);              
    } catch (error) {
        console.error(error)
    }
});



module.exports = { queue }