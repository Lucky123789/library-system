import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 请求拦截器：自动添加 token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器：处理错误
 */
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // token 过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // 将可能的中文错误消息转换为英文
    const errorData = error.response?.data || {};
    if (errorData.message) {
      // 映射中文错误消息到英文
      const messageMap = {
        '您已经借阅了这本书，请先归还': 'You have already borrowed this book. Please return it first.',
        '您已经借阅了这本书': 'You have already borrowed this book. Please return it first.',
        '请先归还': 'Please return it first.'
      };
      
      if (messageMap[errorData.message]) {
        errorData.message = messageMap[errorData.message];
      }
    }
    
    return Promise.reject(errorData || error.message);
  }
);

/**
 * 认证相关 API
 */
export const authAPI = {
  // 注册
  register: (data) => api.post('/auth/register', data),
  
  // 登录
  login: (data) => api.post('/auth/login', data),
  
  // 获取当前用户信息
  getMe: () => api.get('/auth/me')
};

/**
 * 图书相关 API
 */
export const booksAPI = {
  // 获取图书列表
  getBooks: (params) => api.get('/books', { params }),
  
  // 获取单本图书
  getBook: (id) => api.get(`/books/${id}`),
  
  // 创建图书（管理员）
  createBook: (data) => api.post('/books', data),
  
  // 更新图书（管理员）
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  
  // 删除图书（管理员）
  deleteBook: (id) => api.delete(`/books/${id}`)
};

/**
 * 借阅相关 API
 */
export const borrowingsAPI = {
  // 获取我的借阅记录
  getMyBorrowings: () => api.get('/borrowings'),
  
  // 借阅图书
  borrowBook: (bookId) => api.post('/borrowings', { bookId }),
  
  // 归还图书
  returnBook: (borrowingId) => api.put(`/borrowings/${borrowingId}/return`)
};

export default api;

