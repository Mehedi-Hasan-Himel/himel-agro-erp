import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  lastFailedAt: number;
}

// Use global to preserve connection across hot reloads in development
const globalWithMongoose = global as typeof globalThis & {
  mongooseCache: MongooseCache;
};

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = { conn: null, promise: null, lastFailedAt: 0 };
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

  // If connection failed recently (within 30s), fail fast to local store without blocking 4000ms
  if (cache.lastFailedAt && Date.now() - cache.lastFailedAt < 30000) {
    return null;
  }

  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500,
    };
    cache.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((m) => {
        cache.lastFailedAt = 0;
        return m;
      })
      .catch((err) => {
        console.warn("MongoDB connection failed, falling back to local store:", err.message);
        cache.lastFailedAt = Date.now();
        cache.promise = null;
        return null;
      });
  }

  try {
    cache.conn = await cache.promise;
  } catch (_e) {
    cache.lastFailedAt = Date.now();
    cache.promise = null;
    cache.conn = null;
  }

  return cache.conn;
}
