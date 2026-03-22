const mongoose = require('mongoose');

const globalWithMongoose = globalThis;

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = {
    conn: null,
    promise: null,
  };
}

const connectDatabase = async () => {
  const cache = globalWithMongoose.mongooseCache;

  if (cache.conn) {
    return cache.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(process.env.MONGODB_URI).then((connection) => {
      console.log(`MongoDB Database connected with HOST: ${connection.connection.host}`);
      return connection;
    });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
};

module.exports = connectDatabase;
