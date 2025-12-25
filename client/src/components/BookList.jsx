import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { booksAPI, borrowingsAPI } from '../services/api';
import BookForm from './BookForm';

/**
 * 图书列表组件
 * 显示所有图书，支持搜索、借阅，管理员可以管理图书
 */
const BookList = () => {
  const { user, isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * 获取图书列表
   */
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getBooks({
        page,
        limit: 10,
        search: searchTerm
      });
      setBooks(response.books);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      setMessage(error.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 初始化和搜索
   */
  useEffect(() => {
    fetchBooks();
  }, [page, searchTerm]);

  /**
   * 监听 WebSocket 消息：图书更新
   */
  useEffect(() => {
    const handler = (e) => {
      const msg = e.detail;
      
      // 检查是否是 borrow 或 return 事件
      if (msg.action === 'borrow' || msg.action === 'return') {
        console.log(`Data refreshed by WebSocket event (${msg.action})`);
        // 重新请求 API 并更新数据
        fetchBooks();
      }
    };

    // 添加事件监听
    window.addEventListener('ws-message', handler);

    // 组件卸载时移除监听
    return () => {
      window.removeEventListener('ws-message', handler);
    };
  }, [page, searchTerm]);

  /**
   * 处理搜索
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  /**
   * 处理借阅
   */
  const handleBorrow = async (bookId) => {
    try {
      await borrowingsAPI.borrowBook(bookId);
      setMessage('Borrowed successfully!');
      fetchBooks(); // 刷新列表
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to borrow');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  /**
   * 处理删除
   */
  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await booksAPI.deleteBook(bookId);
      setMessage('Deleted successfully!');
      fetchBooks();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to delete');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  /**
   * 打开编辑表单
   */
  const handleEdit = (book) => {
    setEditingBook(book);
    setShowForm(true);
  };

  /**
   * 关闭表单
   */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBook(null);
    fetchBooks();
  };

  return (
    <div className="container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>Book List</h1>
        <div>
          {isAdmin() && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingBook(null);
                setShowForm(true);
              }}
            >
              Add Book
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {/* 搜索框 */}
      <div className="card">
        <form onSubmit={handleSearch}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Search by title, author or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginRight: '10px', width: 'calc(100% - 100px)', display: 'inline-block' }}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '90px' }}>
              Search
            </button>
          </div>
        </form>
      </div>

      {/* 图书列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : books.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          No books available
        </div>
      ) : (
        <>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Total Copies</th>
                  <th>Available Copies</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.totalCopies}</td>
                    <td>
                      <span className={`badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {book.availableCopies}
                      </span>
                    </td>
                    <td>
                      {isAdmin() ? (
                        <>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => handleEdit(book)}
                            style={{ marginRight: '5px' }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleDelete(book._id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button 
                          className="btn btn-success"
                          onClick={() => handleBorrow(book._id)}
                          disabled={book.availableCopies === 0}
                        >
                          {book.availableCopies > 0 ? 'Borrow' : 'Out of Stock'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span style={{ lineHeight: '38px' }}>
                Page {page} of {totalPages}
              </span>
              <button 
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* 图书表单（添加/编辑） */}
      {showForm && (
        <BookForm 
          book={editingBook} 
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default BookList;

