import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 连接 MongoDB 数据库
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/book-management');
    console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB 连接失败: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

