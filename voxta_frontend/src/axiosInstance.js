import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://voxta-service-949877042975.us-central1.run.app/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken'))
      ?.split('=')[1];
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    console.log('Request payload:', config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log('Error code:', error.response.status);
      console.log('Error response:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;