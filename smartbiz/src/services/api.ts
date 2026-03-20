import axios from 'axios';

const API_BASE_URL = 'http://192.168.43.249:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
