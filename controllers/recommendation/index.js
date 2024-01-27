const { setInCache, deleteInCache, getInCache } = require("../../cachingLayer/redisClient");
const Recommendation = require("../../models/Recommendation");

const updateRecommendation = async (viewedBlogId, recommendations) => {
    try {
        let recommendation = await Recommendation.findOne({ viewedBlogId });

        if (!recommendation) {
            recommendation = new Recommendation({ viewedBlogId, recommended: recommendations });
        } else {
            recommendation.recommended = recommendations;
        }
        await recommendation.save();

        //set in cache
        setInCache(`Rec ${viewedBlogId}`, recommendations, 10);

        return recommendation;
    } catch (error) {
        console.error('Error updating recommendation:', error);
        throw error;
    }
};


const saveRecommendation = async (viewedBlogId, recommendations) => {    
    try {        
        let blogExists = await Recommendation.findOne({ viewedBlogId });
        if (blogExists) {
            return updateRecommendation(viewedBlogId, recommendations);
        }        
        const recommendation = new Recommendation({
            viewedBlogId: viewedBlogId,
            recommended: recommendations
        });

        await recommendation.save();

        //set in cache
        setInCache(`Rec ${viewedBlogId}`, recommendations, 10);

        console.log('Recommendation saved successfully');
        return recommendation;
    } catch (error) {
        console.error('Error saving recommendation:', error);
        throw error;
    }
};

const deleteRecommendation = async (viewedBlogId) => {
    try {
        const deletedRecommendation = await Recommendation.findOneAndDelete({ viewedBlogId });

        if (!deletedRecommendation) {
            console.log('No recommendation found for the provided viewedBlogId');
            return null;
        }
        //delete if present
        deleteInCache(`Rec ${viewedBlogId}`);

        console.log('Recommendation deleted successfully');
        return deletedRecommendation;
    } catch (error) {
        console.error('Error deleting recommendation:', error);
        throw error;
    }
};


module.exports = { saveRecommendation, updateRecommendation, deleteRecommendation };