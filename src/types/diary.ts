import { ObjectId } from 'mongodb';

export interface DiaryEntry {
  _id?: ObjectId;
  userId: ObjectId;
  content: string;
  title: string;
  imageUrl: string;
  entryDate: Date;  // The date the entry is about
  createdAt: Date;  // The date the entry was created
  imagePrompt: string;  // Store just the generated image prompt
}

export interface DiaryEntryResponse {
  id: string;
  content: string;
  title: string;
  imageUrl: string;
  entryDate: string;  // ISO string
  createdAt: string;
  imagePrompt?: string;
} 