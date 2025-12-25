import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * 用户模型
 * 包含用户的基本信息和角色（普通用户/管理员）
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username must be at most 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt 字段
});

/**
 * 保存前加密密码
 */
userSchema.pre('save', async function(next) {
  // 如果密码没有被修改，直接返回
  if (!this.isModified('password')) {
    return next();
  }
  
  // 使用 bcrypt 加密密码
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * 比较密码的方法
 * @param {string} candidatePassword - 待验证的密码
 * @returns {Promise<boolean>} - 密码是否匹配
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

