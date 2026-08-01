import mongoose, { Mongoose } from "mongoose";

const MONGO = process.env.MONGO;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseConnection | undefined;
}

const cached: MongooseConnection = global.mongoose || { conn: null, promise: null };

// critical: persist it back so it survives hot reloads
global.mongoose = cached;

export const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!MONGO) throw new Error("MONGO URI is not defined");

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO, {
            bufferCommands: false,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null; // allow retry on next call
        throw err;
    }

    return cached.conn;
};