import mongoose from 'mongoose';

const connectDB = async () => {
  const db_url = process.env.MONGO_URI;

  console.log(db_url)

  try {
    const conn = await mongoose.connect(db_url);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;