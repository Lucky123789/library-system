import mongoose from 'mongoose';

/**
 * 借阅记录模型
 * 记录用户的借书和还书信息
 */
const borrowingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required']
  },
  borrowDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  returnDate: {
    type: Date,
    default: null // null 表示尚未归还
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned'],
    default: 'borrowed'
  }
}, {
  timestamps: true
});

/**
 * 确保一个用户不能同时借阅同一本书的多本（简化处理）
 * 实际业务中可能需要更复杂的逻辑
 */
borrowingSchema.index({ user: 1, book: 1, status: 1 });

const Borrowing = mongoose.model('Borrowing', borrowingSchema);

export default Borrowing;

