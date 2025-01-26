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