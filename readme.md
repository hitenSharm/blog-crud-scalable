get blog by id caching was a bit tricky
as when i want to view a blog that means i need to update the view
this also means that traditionally speaking, i will need to access the blog regardless 
of it being in cache.

3 possible solutions:
1. when a key expires in redis regarding blog id I notify the db to update the views. This also need
 a shadowing kind of mechanism as i cant get the value at key after expiry so i set another key 
 linked to the blogId with the expiry of the primary blogId key+(3 second)(drawback- when scaled if there are lots of keys expiring, this could be an issue. views might be a bit inconsistent at a large scale) (sidenote: i do not have much experience with redis)
2. i create a seperate db in which i just store the blogId whenever someone views it and server found it in cache and returned that response. then we setup a cron job every 4 hours maybe which cleans this db for WasFoundInCache blogIds and updates the views. (Drawback- CRON job can be intensive as there will be cleanup involved and the whole WasFoundInCache blogIds will be queried, slow at scale probably)
3. Make incrementing views a seperate process using something like Bull queues. (maybe the best solution but i do not have enough knowledge or expertise so i went with 1st.)

Other possible places for caching:
1. If we know beforehand about frequent search queries, we can configure to cache those specific keywords
serach will need debouncing on frontend
2. in the latest N blogs endpoint, if we dont care about the correctness of data much we can cache this endpoint with a smaller expiry time of maybe only 15 seconds.
3. most popular blogs same as point 2.

## Recommendation:
I do not know much about how to build one. i have a rough idea from my NLP classes so i did that.
Optimisation: Async processing basic using bull.
There is 1 collection which stores blogId: {reccomended blogIds}
this will also be in redis cache

### When someone hits get recommendation endpoint for a blog:
This is a seperate end point (frontend does a new api call for this)
if(cache hit [blogId]->recommended){
    return recommendations;
}
if(db hit){
    addProcessingForBlogInQueue(blogId);----> might generate new blogs recommendation
    return db answer;
}
if(!db hit and !cache hit){
    addProcessingForBlogInQueue(blogId);----> generate blogs recommendation for the first time
}

### When someone views a blog:

if(cache hit){
    increase view count for blog in cache(shadow key)
    return cache[blog];
}
else{
    cache blog
    if(blog recommendation not in cache){
        addProcessingForBlogInQueue(blogId);----> might generate new blogs recommendation
    }
    increment view
    return blog;
}

### addProcessingForBlogInQueue(blogId):
recommendations=getRecommendations(id);
add in cache
add to recommendation db