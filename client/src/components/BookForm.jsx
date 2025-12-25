import React, { useState, useEffect } from 'react';
import { booksAPI } from '../services/api';

/**
 * 图书表单组件
 * 用于添加或编辑图书（仅管理员）
 */
const BookForm = ({ book, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    totalCopies: 1
  });
  const [errors, setErrors] = useState({
    title: '',
    author: '',
    isbn: '',
    totalCopies: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * 如果是编辑模式，填充表单数据
   */
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        description: book.description || '',
        totalCopies: book.totalCopies || 1
      });
    }
  }, [book]);

  /**
   * 验证单个字段
   */
  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'title') {
      if (!value || value.trim() === '') {
        error = 'This field is required.';
      }
    } else if (name === 'author') {
      if (!value || value.trim() === '') {
        error = 'This field is required.';
      }
    } else if (name === 'isbn') {
      if (!value || value.trim() === '') {
        error = 'This field is required.';
      }
    } else if (name === 'totalCopies') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        error = 'Please enter a number greater than 0.';
      }
    }
    
    return error;
  };

  /**
   * 处理输入变化
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 清除字段错误
    setErrors({
      ...errors,
      [name]: ''
    });
    setError('');
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 手动验证所有必填字段
    const newErrors = {
      title: validateField('title', formData.title),
      author: validateField('author', formData.author),
      isbn: validateField('isbn', formData.isbn),
      totalCopies: validateField('totalCopies', formData.totalCopies)
    };
    
    setErrors(newErrors);
    
    // 如果有任何错误，不提交
    if (newErrors.title || newErrors.author || newErrors.isbn || newErrors.totalCopies) {
      return;
    }
    
    setLoading(true);

    try {
      if (book) {
        // 更新图书
        await booksAPI.updateBook(book._id, formData);
      } else {
        // 创建新图书
        await booksAPI.createBook(formData);
      }
      onClose();
    } catch (error) {
      setError(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ width: '500px', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{book ? 'Edit Book' : 'Add Book'}</h2>
          <button 
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '5px 15px' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter book title"
            />
            {errors.title && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                {errors.title}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Author *</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Enter author name"
            />
            {errors.author && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                {errors.author}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>ISBN *</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="Enter ISBN"
            />
            {errors.isbn && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                {errors.isbn}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter book description (optional)"
            />
          </div>

          <div className="form-group">
            <label>Total Copies *</label>
            <input
              type="number"
              name="totalCopies"
              value={formData.totalCopies}
              onChange={handleChange}
              placeholder="Enter total copies"
            />
            {errors.totalCopies && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                {errors.totalCopies}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;

