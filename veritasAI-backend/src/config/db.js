import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Starting without MongoDB.");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected successfully");
  } catch (error) {
    console.log("DB connection failed ", error.message);
    process.exit(1);
  }
};

export default connectDB;
