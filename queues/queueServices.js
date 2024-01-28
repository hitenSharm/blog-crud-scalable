const { getInCache } = require("../cachingLayer/redisClient");
const Recommendation = require("../models/Recommendation");
const { queue } = require("./processingQueue");

const addBlogToQueue = async (viewedBlogId) => {
    const res = await queue.add('generate-recommendations', { viewedBlogId });
    return res;
}

const checkDbForRec = async (viewedBlogId) => {
    //there should be a check for making sure the blog exists in the db itself 
    let recommendationCheck = await getInCache(`Rec ${viewedBlogId}`);
    if (recommendationCheck) {
        return recommendationCheck;
    }
    recommendationCheck = await Recommendation.findOne({ viewedBlogId });
    addBlogToQueue(viewedBlogId); //db se mila but data can be old
    return recommendationCheck;
}

module.exports = { checkDbForRec };