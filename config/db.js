import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");
    console.log(mongoose.connection.readyState);
    console.log(mongoose.connection.host);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;