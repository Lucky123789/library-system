import express from 'express';
import Borrowing from '../models/Borrowing.js';
import Book from '../models/Book.js';
import { authenticate } from '../middleware/auth.js';
import { broadcast } from '../utils/websocket.js';

const router = express.Router();

/**
 * 获取当前用户的借阅记录
 * GET /api/borrowings
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const borrowings = await Borrowing.find({ user: req.user._id })
      .populate('book', 'title author isbn')
      .sort({ borrowDate: -1 });

    res.json(borrowings);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch borrowings', 
      error: error.message 
    });
  }
});

/**
 * 借阅图书
 * POST /api/borrowings
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: 'Please provide book ID' });
    }

    // 查找图书
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // 检查是否有可借册数
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'This book is out of stock' });
    }

    // 检查用户是否已经借阅了这本书且未归还
    const existingBorrowing = await Borrowing.findOne({
      user: req.user._id,
      book: bookId,
      status: 'borrowed'
    });

    if (existingBorrowing) {
      return res.status(400).json({ message: 'You have already borrowed this book. Please return it first.' });
    }

    // 创建借阅记录
    const borrowing = new Borrowing({
      user: req.user._id,
      book: bookId,
      borrowDate: new Date(),
      status: 'borrowed'
    });

    await borrowing.save();

    // 减少可借册数
    book.availableCopies -= 1;
    await book.save();

    // 填充图书信息后返回
    await borrowing.populate('book', 'title author isbn');

    // 广播借书事件
    broadcast({
      action: 'borrow',
      bookId: bookId,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Borrowed successfully',
      borrowing
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to borrow', 
      error: error.message 
    });
  }
});

/**
 * 归还图书
 * PUT /api/borrowings/:id/return
 */
router.put('/:id/return', authenticate, async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id)
      .populate('book');

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    // 检查是否是当前用户的借阅记录
    if (borrowing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to operate this borrowing record' });
    }

    // 检查是否已经归还
    if (borrowing.status === 'returned') {
      return res.status(400).json({ message: 'This book has already been returned' });
    }

    // 更新借阅记录
    borrowing.status = 'returned';
    borrowing.returnDate = new Date();
    await borrowing.save();

    // 增加可借册数
    const book = await Book.findById(borrowing.book._id);
    if (book) {
      book.availableCopies += 1;
      // 确保不超过总册数
      if (book.availableCopies > book.totalCopies) {
        book.availableCopies = book.totalCopies;
      }
      await book.save();
    }

    // 填充图书信息后返回
    await borrowing.populate('book', 'title author isbn');

    // 广播还书事件
    broadcast({
      action: 'return',
      bookId: borrowing.book._id.toString(),
      timestamp: new Date().toISOString()
    });

    res.json({
      message: 'Returned successfully',
      borrowing
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to return', 
      error: error.message 
    });
  }
});

export default router;

