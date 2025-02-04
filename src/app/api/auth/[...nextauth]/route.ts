import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';
import { User } from '@/types/user';
import { ObjectId } from 'mongodb';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide NEXTAUTH_SECRET environment variable');
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please enter both username and password');
        }

        try {
          const db = await getDb();
          const usersCollection = db.collection<User>('users');
          
          const user = await usersCollection.findOne({ username: credentials.username });
          
          if (!user) {
            throw new Error('Invalid username or password');
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValidPassword) {
            throw new Error('Invalid username or password');
          }

          return {
            id: user._id?.toString() || new ObjectId().toString(),
            name: user.username,
            email: user.email
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed. Please try again.');
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const db = await getDb();
          const usersCollection = db.collection<User>('users');
          
          // Check if user already exists
          const existingUser = await usersCollection.findOne({ email: user.email });
          if (!existingUser) {
            // Create new user if doesn't exist
            await usersCollection.insertOne({
              username: user.name || user.email.split('@')[0] || 'user',
              email: user.email,
              password: '', // Google users don't need password
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        } catch (error) {
          console.error('Google sign in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // Add provider to session if needed
        (session as any).provider = token.provider;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST }; 