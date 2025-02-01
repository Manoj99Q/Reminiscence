import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  const db = client.db('Reminiscence');

  // Ensure indexes exist
  await ensureIndexes(db);

  return db;
}

async function ensureIndexes(db: any) {
  try {
    const entriesCollection = db.collection('diary_entries');
    
    // Get existing indexes
    const indexes = await entriesCollection.indexes();
    const hasEntryDateIndex = indexes.some(
      (index: any) => index.key && index.key.entryDate
    );

    // Create index if it doesn't exist
    if (!hasEntryDateIndex) {
      console.log('Creating index on entryDate...');
      await entriesCollection.createIndex(
        { entryDate: -1 },
        { background: true }
      );
    }

    // Also ensure we have an index on userId for efficient queries
    const hasUserIdIndex = indexes.some(
      (index: any) => index.key && index.key.userId
    );

    if (!hasUserIdIndex) {
      console.log('Creating index on userId...');
      await entriesCollection.createIndex(
        { userId: 1 },
        { background: true }
      );
    }

    // Compound index for userId + entryDate for efficient sorted queries per user
    const hasCompoundIndex = indexes.some(
      (index: any) => 
        index.key && 
        index.key.userId && 
        index.key.entryDate
    );

    if (!hasCompoundIndex) {
      console.log('Creating compound index on userId + entryDate...');
      await entriesCollection.createIndex(
        { userId: 1, entryDate: -1 },
        { background: true }
      );
    }
  } catch (error) {
    console.error('Error ensuring indexes:', error);
    // Don't throw - we can still operate without indexes
  }
}

export default clientPromise; 