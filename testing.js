const Redis = require('ioredis');

const publishClient = new Redis();
const subscribeClient = new Redis();

publishClient.on('ready', () => {
  // Enable keyspace events
  publishClient.config('SET', 'notify-keyspace-events', 'Ex');
});

subscribeClient.on('ready', () => {
  subscribeClient.subscribe('__keyevent@0__:expired', (err, count) => {
    if (err) {
      console.error('Error subscribing to keyspace events:', err);
    } else {
      console.log(`Subscribed to expired key events, ${count} total channels`);
    }
  });

  subscribeClient.on('message', (channel, key) => {
    console.log(`Key expired: ${key}`);
    // Perform actions based on key expiration
  });
});

publishClient.set('myKey', 'myValue', 'EX', 5)