const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecommendationSchema = new Schema({
    viewedBlogId: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: true
    },
    recommended: [{
      blogId: {
        type: Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
      },
      similarity: {
        type: Number,
        required: true
      }
    }]
  });

const Recommendation = mongoose.model('Recommendation', RecommendationSchema);
module.exports = Recommendation;
