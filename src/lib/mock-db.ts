// Temporary mock database for testing when MongoDB is not available
// Remove this file once you have MongoDB set up

// Mock ObjectId class to replace MongoDB's ObjectId
export class ObjectId {
  private id: string;
  
  constructor(id?: string) {
    this.id = id || Math.random().toString(36).substr(2, 9);
  }
  
  toString(): string {
    return this.id;
  }
  
  toHexString(): string {
    return this.id;
  }
  
  equals(other: any): boolean {
    return this.id === other?.toString();
  }
}

interface MockUser {
  _id: string;
  username: string;
  password: string;
  createdAt: Date;
}

interface MockDiaryEntry {
  _id: string;
  userId: string;
  content: string;
  title: string;
  imageUrl: string;
  entryDate: Date;
  createdAt: Date;
  imagePrompt: string;
  stylizedContent: string;
  authorStyle: string;
}

interface MockUserProfile {
  _id: string;
  userId: string;
  gender?: string;
  ageRange?: string;
  ethnicity?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockNewEntry {
  _id: string;
  userId: string;
  content: string;
  entryDate: Date;
  selectedCollection?: {
    id: string;
    name: string;
    icon: string;
    description: string;
  };
  location?: string;
  photoMode: 'manual' | 'ai';
  generatedImage?: string;
  uploadedImage?: string;
  timestamp: string;
}

interface MockAIAnalysis {
  _id: string;
  userId: string;
  entryId?: string;
  content: string;
  analysis: {
    reflection: string;
    keyInsights: string[];
    feelings: string[];
    people: string[];
    mood: 'positive' | 'neutral' | 'negative';
  };
  createdAt: Date;
  timestamp: string;
}

class MockDatabase {
  private users: MockUser[] = [];
  private diaryEntries: MockDiaryEntry[] = [];
  private userProfiles: MockUserProfile[] = [];
  private newEntries: MockNewEntry[] = [];
  private aiAnalyses: MockAIAnalysis[] = [];
  private nextId = 1;


  collection<T>(name: string) {
    return {
      findOne: (query: any) => this.findOneWithCollection(name, query),
      find: (query: any) => {
        return {
          sort: (sortOptions: any) => ({
            toArray: async () => {
              const results = await this.findWithCollection(name, query);
              return this.addSortToFind(results, sortOptions);
            }
          }),
          toArray: async () => {
            return await this.findWithCollection(name, query);
          }
        };
      },
      insertOne: (item: any) => this.insertOneWithCollection(name, item),
      deleteMany: (query: any) => this.deleteManyWithCollection(name, query),
      indexes: async () => [], // Mock indexes method
      createIndex: async () => {}, // Mock createIndex method
    } as any;
  }

  // Add sort method to the find result
  private addSortToFind(findResult: any[], sortOptions: any): any[] {
    if (!sortOptions || Object.keys(sortOptions).length === 0) {
      return findResult;
    }

    return findResult.sort((a, b) => {
      for (const [field, direction] of Object.entries(sortOptions)) {
        const aValue = a[field];
        const bValue = b[field];
        
        if (aValue instanceof Date && bValue instanceof Date) {
          const comparison = aValue.getTime() - bValue.getTime();
          if (comparison !== 0) {
            return direction === -1 ? -comparison : comparison;
          }
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          if (comparison !== 0) {
            return direction === -1 ? -comparison : comparison;
          }
        } else {
          const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          if (comparison !== 0) {
            return direction === -1 ? -comparison : comparison;
          }
        }
      }
      return 0;
    });
  }

  private async findOneWithCollection(collectionName: string, query: any): Promise<any> {
    const collection = this.getCollectionByName(collectionName);
    if (!collection) return null;
    
    return collection.find((item: any) => 
      Object.keys(query).every(key => {
        if (key === 'userId' && query[key]) {
          // Handle both ObjectId objects and string userIds
          const queryUserId = typeof query[key] === 'object' && query[key].toString ? 
            query[key].toString() : query[key];
          return item[key] === queryUserId;
        }
        return item[key as keyof typeof item] === query[key];
      })
    ) || null;
  }

  private async findWithCollection(collectionName: string, query: any): Promise<any[]> {
    const collection = this.getCollectionByName(collectionName);
    if (!collection) return [];
    
    return collection.filter((item: any) => 
      Object.keys(query).every(key => {
        if (key === 'userId' && query[key]) {
          // Handle both ObjectId objects and string userIds
          const queryUserId = typeof query[key] === 'object' && query[key].toString ? 
            query[key].toString() : query[key];
          return item[key] === queryUserId;
        }
        return item[key as keyof typeof item] === query[key];
      })
    );
  }

  private async insertOneWithCollection(collectionName: string, item: any): Promise<{ insertedId: string }> {
    const newItem = {
      ...item,
      _id: this.nextId.toString(),
    };
    
    // Convert ObjectId userId to string if needed
    if (newItem.userId && typeof newItem.userId === 'object' && newItem.userId.toString) {
      newItem.userId = newItem.userId.toString();
    }
    
    this.nextId++;
    
    const collection = this.getCollectionByName(collectionName);
    if (collection) {
      collection.push(newItem);
      console.log('Mock DB - Item inserted:', { collectionName, insertedId: newItem._id, item: newItem });
    } else {
      console.error('Mock DB - Collection not found:', collectionName);
    }
    
    return { insertedId: newItem._id };
  }

  private async deleteManyWithCollection(collectionName: string, query: any): Promise<{ deletedCount: number }> {
    const collection = this.getCollectionByName(collectionName);
    if (!collection) return { deletedCount: 0 };
    
    const initialLength = collection.length;
    const filtered = collection.filter((item: any) => 
      !Object.keys(query).every(key => {
        if (key === 'userId' && query[key]) {
          // Handle both ObjectId objects and string userIds
          const queryUserId = typeof query[key] === 'object' && query[key].toString ? 
            query[key].toString() : query[key];
          return item[key] === queryUserId;
        }
        return item[key as keyof typeof item] === query[key];
      })
    );
    
    // Replace the collection with filtered items
    if (collection === this.users) {
      this.users = filtered as MockUser[];
    } else if (collection === this.diaryEntries) {
      this.diaryEntries = filtered as MockDiaryEntry[];
    } else if (collection === this.userProfiles) {
      this.userProfiles = filtered as MockUserProfile[];
    } else if (collection === this.newEntries) {
      this.newEntries = filtered as MockNewEntry[];
    } else if (collection === this.aiAnalyses) {
      this.aiAnalyses = filtered as MockAIAnalysis[];
    }
    
    return { deletedCount: initialLength - filtered.length };
  }

  private getCollectionByName(name: string): any[] | null {
    switch (name) {
      case 'users':
        return this.users;
      case 'diary_entries':
        return this.diaryEntries;
      case 'user_profiles':
        return this.userProfiles;
      case 'new_entries':
        return this.newEntries;
      case 'ai_analyses':
        return this.aiAnalyses;
      case 'manage_entries':
        // Return combined entries for manage page
        return this.newEntries.map(entry => {
          const analysis = this.aiAnalyses.find(a => a.entryId === entry._id);
          return {
            ...entry,
            aiAnalysis: analysis ? {
              id: analysis._id,
              reflection: analysis.analysis.reflection,
              keyInsights: analysis.analysis.keyInsights,
              feelings: analysis.analysis.feelings,
              people: analysis.analysis.people,
              mood: analysis.analysis.mood,
              createdAt: analysis.createdAt.toISOString()
            } : null
          };
        });
      default:
        return null;
    }
  }
}

const mockDb = new MockDatabase();

export async function getMockDb() {
  return mockDb;
}
