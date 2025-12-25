import express from 'express';
import Book from '../models/Book.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * 获取所有图书（支持分页和搜索）
 * GET /api/books
 * 查询参数: page, limit, search
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // 构建搜索条件
    const searchCondition = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
            { isbn: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    // 查询图书
    const books = await Book.find(searchCondition)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // 获取总数
    const total = await Book.countDocuments(searchCondition);

    res.json({
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch books', 
      error: error.message 
    });
  }
});

/**
 * 根据ID获取单本图书
 * GET /api/books/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get book information', 
      error: error.message 
    });
  }
});

/**
 * 创建新图书（仅管理员）
 * POST /api/books
 */
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, author, isbn, description, totalCopies } = req.body;

    // 验证必填字段
    if (!title || !author || !isbn || !totalCopies) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // 检查ISBN是否已存在
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'This ISBN already exists' });
    }

    // 创建新图书
    const book = new Book({
      title,
      author,
      isbn,
      description: description || '',
      totalCopies,
      availableCopies: totalCopies
    });

    await book.save();

    res.status(201).json({
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to create book', 
      error: error.message 
    });
  }
});

/**
 * 更新图书信息（仅管理员）
 * PUT /api/books/:id
 */
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, author, isbn, description, totalCopies } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // 如果修改了ISBN，检查是否与其他图书冲突
    if (isbn && isbn !== book.isbn) {
      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        return res.status(400).json({ message: 'This ISBN is already used by another book' });
      }
    }

    // 更新图书信息
    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn) book.isbn = isbn;
    if (description !== undefined) book.description = description;
    
    // 如果修改了总册数，需要调整可借册数
    if (totalCopies !== undefined) {
      const oldTotal = book.totalCopies;
      book.totalCopies = totalCopies;
      // 如果总册数增加，可借册数也相应增加
      if (totalCopies > oldTotal) {
        book.availableCopies += (totalCopies - oldTotal);
      } else if (totalCopies < oldTotal) {
        // 如果总册数减少，可借册数也相应减少（但不能小于0）
        const reduction = oldTotal - totalCopies;
        book.availableCopies = Math.max(0, book.availableCopies - reduction);
      }
    }

    await book.save();

    res.json({
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update book', 
      error: error.message 
    });
  }
});

/**
 * 删除图书（仅管理员）
 * DELETE /api/books/:id
 */
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // 检查是否有未归还的借阅记录
    const Borrowing = (await import('../models/Borrowing.js')).default;
    const activeBorrowings = await Borrowing.countDocuments({
      book: book._id,
      status: 'borrowed'
    });

    if (activeBorrowings > 0) {
      return res.status(400).json({ 
        message: `Cannot delete: This book has ${activeBorrowings} unreturned copy/copies` 
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete book', 
      error: error.message 
    });
  }
});

export default router;

