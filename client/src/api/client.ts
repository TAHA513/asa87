
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // معالجة الأخطاء العامة مثل 401 (غير مصرح)
    if (error.response && error.response.status === 401) {
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);
