import mongoose, {Mongoose} from "mongoose";

const MONGO = process.env.MONGO

interface MongooseConnection {
    connect: Mongoose | null;
    promise: Promise<Mongoose> | null;
}


const cached:  MongooseConnection = (global as {
    mongoose?:MongooseConnection
}).mongoose || {
    connect:null,
    promise:null
};

export const connectDB = async()=>{
    if(cached.connect) return cached.connect;

    if(!MONGO) throw new Error ("MONGO URI is not defined");

    cached.promise = cached.promise || mongoose.connect(MONGO, {
        bufferCommands: false,
    });
    cached.connect = await cached.promise;
    return cached.connect;
}