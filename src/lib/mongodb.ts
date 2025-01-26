import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().then(async (client) => {
      // Create indexes when connection is established
      const db = client.db('Moments');
      await db.collection('diary_entries').createIndex({ userId: 1 });
      await db.collection('diary_entries').createIndex({ date: -1 }); // For sorting
      return client;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  const client = new MongoClient(uri, options);
  clientPromise = client.connect().then(async (client) => {
    // Create indexes in production too
    const db = client.db('Moments');
    await db.collection('diary_entries').createIndex({ userId: 1 });
    await db.collection('diary_entries').createIndex({ date: -1 }); // For sorting
    return client;
  });
}

export default clientPromise;

export const getDb = async () => {
  const client = await clientPromise;
  return client.db('Moments');
}; 