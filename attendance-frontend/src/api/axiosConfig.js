import axios from 'axios';

// Tạo một instance của axios với cấu hình mặc định
const apiClient = axios.create({
  // URL nền của Backend Django
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;