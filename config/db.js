// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);

//     console.log("✅ MongoDB Connected");
//     console.log(mongoose.connection.readyState);
//     console.log(mongoose.connection.host);
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// };

// export default connectDB;





// new version 

import mongoose from 'mongoose';

// ✅ Cache the connection on globalThis so it survives module reloads
let cached = globalThis._mongo;
if (!cached) {
  cached = globalThis._mongo = { conn: null, promise: null };
}

const connectDB = async () => {
  // ✅ Return existing connection if already connected
  if (cached.conn) {
    return cached.conn;
  }

  // ✅ If a connection attempt is already in flight, reuse it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,        // fail fast instead of hanging
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,              // important on serverless
      minPoolSize: 0,
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((m) => {
        console.log('✅ MongoDB Connected:', m.connection.host);
        return m;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        cached.promise = null;      // allow retry on next request
        global.__lastMongoError = err.message;
        throw err;                  // rethrow so caller can respond 503
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    throw err;
  }
};

// ✅ Export status helper for /health endpoint and per-request guard
export function getMongoStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    error: global.__lastMongoError || null,
  };
}

export default connectDB;