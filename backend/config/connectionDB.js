import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB connected`)
    } catch (error) {
        console.log("MongoDB connection error",error);
    }
}

export default connectDB;