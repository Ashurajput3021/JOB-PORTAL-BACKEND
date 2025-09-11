import mongoose from "mongoose";

const connectDb = async () => {
  try {
    console.log("🔄 Trying to connect to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "jobportal", // Specify the DB name here
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
};

export default connectDb;
