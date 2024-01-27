const Redis = require('ioredis');
const { updateBlogViewCount } = require('../controllers/blogController/blogService');

const publishClient = new Redis();
const subscribeClient = new Redis();

const test = () => {
  console.log(publishClient.status)
}

(() => test())();


publishClient.on('ready', () => {
  // Enable keyspace events  
  publishClient.config('SET', 'notify-keyspace-events', 'Ex');
});

publishClient.on('connect', () => {
  console.log("CONNECTED");
})
publishClient.on('error', (err) => {
  console.log(err);
})

//caching services was having difficulty in export so did this instead

const getInCache = (key) => {
  return new Promise((resolve, reject) => {
    if (!publishClient) {
      reject(new Error('Redis client is not initialized'));
      return;
    }

    publishClient.get(key, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data ? JSON.parse(data) : null);
      }
    });
  });
};

const setInCache = (key, data, expiresIn = 3600) => {
  publishClient.set(key, JSON.stringify(data), 'EX', expiresIn);
};

const deleteInCache = (key) => {
  publishClient.del(key);
};

const increaseKeyValue = async (key) => {
  try {
    const newValue = await publishClient.incr(key);
    console.log(`The new value of is: ${newValue}`);
  } catch (error) {
    console.error(error);
  }
}

subscribeClient.on('ready', () => {
  subscribeClient.subscribe('__keyevent@0__:expired', (err, count) => {
    if (err) {
      console.error('Error subscribing to keyspace events:', err);
    } else {
      console.log(`Subscribed to expired key events, ${count} total channels`);
    }
  });

  subscribeClient.on('message', async (channel, key) => {
    let splitKeys = key.split(' ');
    if (splitKeys.length > 1 && splitKeys[0] == "blogId") {
      let secondaryKey = "view " + splitKeys[1];
      let blogId = splitKeys[1];
      let value = await getInCache(secondaryKey);
      if(value>1){
        let res = await updateBlogViewCount(blogId, value-1);
        //this is because when someone views a blog, they cache the count as 1 too
        //so this will lead to 1(done automatically during query)+ 1(user set in cache). this is wrong
        console.log("updated view count");
      }
      
      //this updates view count from cache-----------------------------
      
    }
  });
});




module.exports = { publishClient, getInCache, setInCache, increaseKeyValue, deleteInCache };