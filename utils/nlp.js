const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const { removeStopwords } = require('stopword')
const TfIdf = natural.TfIdf;

const preprocessText = (text) => {
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const newText = removeStopwords(tokens);
    return newText.join(' ');
};

const calculateDotProduct = (vector1, vector2) => {
    let dotProduct = 0;
    for (const term1 of vector1) {
        for (const term2 of vector2) {
            if (term1.term === term2.term) {
                dotProduct += term1.tfidf * term2.tfidf;
                break;
            }
        }
    }
    return dotProduct;
};

const calculateMagnitude = (vector) => {
    let magnitude = 0;
    for (const term of vector) {
        magnitude += Math.pow(term.tfidf, 2);
    }
    return Math.sqrt(magnitude);
};

const calculateSimilarity = (text1, text2) => {
    // const shorterLength = Math.min(text1.length, text2.length);
    // let str1 = text1.slice(0, shorterLength);
    // let str2 = text2.slice(0, shorterLength);
    // const similarity = natural.HammingDistance(str1, str2);
    //haming distance is not that great as it ends up also reccomending things which have very less text
    //even if they are completely different
    const tfidf = new TfIdf();
    
    tfidf.addDocument(text1);
    tfidf.addDocument(text2);

    const vector1 = tfidf.listTerms(0); // TF-IDF vector for document 1
    const vector2 = tfidf.listTerms(1); // TF-IDF vector for document 2

    // Calculate cosine similarity between the vectors
    const dotProduct = calculateDotProduct(vector1, vector2);
    const magnitude1 = calculateMagnitude(vector1);
    const magnitude2 = calculateMagnitude(vector2);
    const similarity = dotProduct / (magnitude1 * magnitude2);

    return similarity;
};

module.exports = {
    preprocessText,
    calculateSimilarity,
};