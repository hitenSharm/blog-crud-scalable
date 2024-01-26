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