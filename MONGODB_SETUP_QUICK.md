# Quick MongoDB Setup for Reminiscence App

## The Issue
Your registration is failing because MongoDB is not installed/running locally.

## Quick Solution: MongoDB Atlas (Cloud Database)

### Step 1: Create Free MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" and create an account
3. Create a new cluster (choose the FREE tier)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 3: Update Environment Variables
Replace the content in your `.env.local` file:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=reminiscence
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Important:** Replace `username:password` with your actual Atlas username and password.

### Step 4: Restart Your Server
```bash
npm run dev
```

## Alternative: Install MongoDB Locally

### Windows:
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will start automatically as a service

### Test Connection:
```bash
mongosh mongodb://localhost:27017
```

## Current Error
The 500 error occurs because the app can't connect to MongoDB. Once you have MongoDB running (either Atlas or local), the registration will work.
