import mongoose from 'mongoose';

let isConnected = false; 

const connectDB = async () => {
  const db_url = process.env.MONGO_URI;

  if (!db_url) {
    console.error("❌ MONGO_URI is not defined in Environment Variables");
    return;
  }
  if (isConnected) {
    console.log('=> Using existing database connection');
    return;
  }

  try {
    const db = await mongoose.connect(db_url, {
      bufferCommands: false, 
    });

    isConnected = db.connections[0].readyState;
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    throw error; 
  }
};

export default connectDB;