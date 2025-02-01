import { MongoClient } from 'mongodb';

// Only throw the error if we're not building and the URI is missing
if (process.env.NODE_ENV !== 'production' && !process.env.MONGODB_URI && process.env.NEXT_PHASE !== 'phase-production-build') {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI || 'mongodb://placeholder-during-build';
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
    const profilesCollection = db.collection('user_profiles');
    
    // Get existing indexes
    const entriesIndexes = await entriesCollection.indexes();
    const profilesIndexes = await profilesCollection.indexes();

    // Check and create indexes for diary entries
    const hasEntryDateIndex = entriesIndexes.some(
      (index: any) => index.key && index.key.entryDate
    );

    if (!hasEntryDateIndex) {
      console.log('Creating index on entryDate...');
      await entriesCollection.createIndex(
        { entryDate: -1 },
        { background: true }
      );
    }

    const hasUserIdIndex = entriesIndexes.some(
      (index: any) => index.key && index.key.userId
    );

    if (!hasUserIdIndex) {
      console.log('Creating index on userId...');
      await entriesCollection.createIndex(
        { userId: 1 },
        { background: true }
      );
    }

    const hasCompoundIndex = entriesIndexes.some(
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

    // Check and create index for user profiles
    const hasProfileUserIdIndex = profilesIndexes.some(
      (index: any) => index.key && index.key.userId
    );

    if (!hasProfileUserIdIndex) {
      console.log('Creating index on userId for user_profiles...');
      await profilesCollection.createIndex(
        { userId: 1 },
        { background: true, unique: true }
      );
    }
  } catch (error) {
    console.error('Error ensuring indexes:', error);
    // Don't throw - we can still operate without indexes
  }
}

export default clientPromise; 