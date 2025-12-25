import React, { useState, useEffect } from 'react';
import { borrowingsAPI } from '../services/api';

/**
 * 我的借阅记录组件
 * 显示当前用户的所有借阅记录，支持归还操作
 */
const MyBorrowings = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  /**
   * 获取借阅记录
   */
  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const data = await borrowingsAPI.getMyBorrowings();
      setBorrowings(data);
    } catch (error) {
      setMessage(error.message || 'Failed to fetch borrowings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 初始化
   */
  useEffect(() => {
    fetchBorrowings();
  }, []);

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
        fetchBorrowings();
      }
    };

    // 添加事件监听
    window.addEventListener('ws-message', handler);

    // 组件卸载时移除监听
    return () => {
      window.removeEventListener('ws-message', handler);
    };
  }, []);

  /**
   * 处理归还
   */
  const handleReturn = async (borrowingId) => {
    if (!window.confirm('Are you sure you want to return this book?')) {
      return;
    }

    try {
      await borrowingsAPI.returnBook(borrowingId);
      setMessage('Returned successfully!');
      fetchBorrowings();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to return');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US');
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>My Borrowings</h1>

      {message && (
        <div className={`alert ${message.includes('successfully') || message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : borrowings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          No borrowings found
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Borrow Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {borrowings.map((borrowing) => (
                <tr key={borrowing._id}>
                  <td>{borrowing.book?.title || '-'}</td>
                  <td>{borrowing.book?.author || '-'}</td>
                  <td>{borrowing.book?.isbn || '-'}</td>
                  <td>{formatDate(borrowing.borrowDate)}</td>
                  <td>{formatDate(borrowing.returnDate)}</td>
                  <td>
                    <span className={`badge ${borrowing.status === 'borrowed' ? 'badge-info' : 'badge-success'}`}>
                      {borrowing.status === 'borrowed' ? 'Borrowed' : 'Returned'}
                    </span>
                  </td>
                  <td>
                    {borrowing.status === 'borrowed' && (
                      <button 
                        className="btn btn-success"
                        onClick={() => handleReturn(borrowing._id)}
                      >
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBorrowings;

