import mongoose from 'mongoose';

/**
 * 图书模型
 * 包含图书的基本信息和库存状态
 */
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies is required'],
    min: [1, 'Total copies must be at least 1']
  },
  availableCopies: {
    type: Number,
    required: [true, 'Available copies is required'],
    min: [0, 'Available copies cannot be negative'],
    default: function() {
      return this.totalCopies; // 默认可借册数等于总册数
    }
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt 字段
});

/**
 * 验证可借册数不超过总册数
 */
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);

export default Book;

