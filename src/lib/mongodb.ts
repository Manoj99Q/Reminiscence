import { MongoClient, ObjectId } from 'mongodb';
import { getMockDb } from './mock-db';

// Re-export ObjectId for use in other files
export { ObjectId };

const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

let clientPromise: Promise<MongoClient> | undefined;

export async function getDb() {
  // Check if we're in mock mode (no MongoDB URI set)
  const uriFromEnv = process.env.MONGODB_URI;
  console.log('🔍 Debug - MONGODB_URI:', uriFromEnv ? 'SET' : 'NOT SET');
  console.log('🔍 Debug - NODE_ENV:', process.env.NODE_ENV);
  
  if (!uriFromEnv || uriFromEnv === 'mongodb://localhost:27017') {
    console.log('⚠️  MongoDB not configured, using mock database for development');
    console.log('📝 To use real MongoDB, set up MongoDB Atlas or install MongoDB locally');
    console.log('📖 See MONGODB_SETUP_QUICK.md for instructions');
    return getMockDb();
  }

  if (!clientPromise) {

    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };

      if (!globalWithMongo._mongoClientPromise) {
        const client = new MongoClient(uriFromEnv, options);
        globalWithMongo._mongoClientPromise = client.connect();
      }
      clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      // In production mode, it's best to not use a global variable.
      const client = new MongoClient(uriFromEnv, options);
      clientPromise = client.connect();
    }
  }

  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || 'reminiscence';
  const db = client.db(dbName);

  // Ensure indexes exist
  await ensureIndexes(db);

  return db;
}

async function ensureIndexes(db: any) {
  try {
    const entriesCollection = db.collection('diary_entries');
    const profilesCollection = db.collection('user_profiles');
    
    // Get existing indexes - handle case where collections don't exist yet
    let entriesIndexes = [];
    let profilesIndexes = [];
    
    try {
      entriesIndexes = await entriesCollection.indexes();
    } catch (error) {
      console.log('diary_entries collection does not exist yet, will create indexes when first document is inserted');
    }
    
    try {
      profilesIndexes = await profilesCollection.indexes();
    } catch (error) {
      console.log('user_profiles collection does not exist yet, will create indexes when first document is inserted');
    }

    // Check and create indexes for diary entries (only if collection exists)
    if (entriesIndexes.length > 0) {
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
    }

    // Check and create index for user profiles (only if collection exists)
    if (profilesIndexes.length > 0) {
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
    }
  } catch (error) {
    console.error('Error ensuring indexes:', error);
    // Don't throw - we can still operate without indexes
  }
}

export default clientPromise; 