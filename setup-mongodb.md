# MongoDB Setup Instructions

## Option 1: Local MongoDB Installation

1. **Download MongoDB Community Server** from https://www.mongodb.com/try/download/community
2. **Install MongoDB** following the installation wizard
3. **Start MongoDB service**:
   - Windows: MongoDB should start automatically as a service
   - Or run: `mongod --dbpath "C:\data\db"`

## Option 2: MongoDB Atlas (Cloud Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Update `.env.local` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   ```

## Option 3: Docker (if you have Docker installed)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Verify MongoDB is running

Test the connection:
```bash
mongosh mongodb://localhost:27017
```

## Environment Variables

Make sure your `.env.local` file contains:
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=reminiscence
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```
