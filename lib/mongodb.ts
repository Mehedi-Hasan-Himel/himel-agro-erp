import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

// Use global to preserve connection across hot reloads in development
const globalWithMongoose = global as typeof globalThis & {
  mongooseCache: MongooseCache;
};

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = { conn: null, promise: null };
}

const cache = globalWithMongoose.mongooseCache;

export function isMongoConfigured(): boolean {
  if (!MONGODB_URI) return false;
  if (MONGODB_URI.includes("<CLUSTER_HOSTNAME>")) return false;
  if (MONGODB_URI.includes("<password>")) return false;
  return MONGODB_URI.startsWith("mongodb://") || MONGODB_URI.startsWith("mongodb+srv://");
}

export async function connectDB(): Promise<typeof mongoose | null> {
  if (!isMongoConfigured()) {
    return null;
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
    };
    cache.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((m) => {
        return m;
      })
      .catch((err) => {
        console.warn("MongoDB connection failed, falling back to local store:", err.message);
        cache.promise = null;
        return null;
      });
  }

  try {
    cache.conn = await cache.promise;
  } catch (_e) {
    cache.promise = null;
    cache.conn = null;
  }

  return cache.conn;
}
