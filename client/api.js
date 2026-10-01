import axios from 'axios';

// Instance axios commune avec credentials (pour les cookies de session)
const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

export default api;
