import { ObjectId } from 'mongodb';

export interface User {
  _id?: string;
  username: string;
  password: string;
  createdAt: Date;
}

export interface UserResponse {
  _id: string;
  username: string;
  createdAt: Date;
}

export interface UserProfile {
  userId: ObjectId;
  gender?: string;
  ageRange?: string;
  ethnicity?: string;
  updatedAt?: Date;
}

export type GenderOption = 
  | 'male' 
  | 'female' 
;

export type AgeRangeOption =
  | '18-24'
  | '25-34'
  | '35-44'
  | '45-54'
  | '55+'
  | 'prefer-not-to-say';

export type ArtStyleOption =
  | 'realistic'
  | 'artistic'
  | 'anime'
  | 'watercolor'
  | 'digital-art'
  | 'photography'; 