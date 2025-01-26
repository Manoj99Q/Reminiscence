import { ObjectId } from 'mongodb';

export interface DiaryEntry {
  _id?: ObjectId;
  userId: ObjectId;
  content: string;
  imageUrl: string;
  date: Date;
  createdAt: Date;
  imagePrompt: string;  // Store just the generated image prompt
}

export interface DiaryEntryResponse {
  id: string;
  content: string;
  imageUrl: string;
  date: string;
  createdAt: string;
} 