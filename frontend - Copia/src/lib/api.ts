import axios from 'axios';

// Função para detectar URL da API baseado no hostname
const getApiUrl = (): string => {
  if (typeof window === 'undefined') return '';
  
  const currentHost = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Localhost
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // IP direto - usar porta 3001
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(currentHost)) {
    return `${protocol}//${currentHost}:3001`;
  }
  
  // front-xxx -> api-xxx
  if (currentHost.startsWith('front-')) {
    return `${protocol}//${currentHost.replace(/^front-/, 'api-')}`;
  }
  
  // frontend-xxx -> api-xxx
  if (currentHost.startsWith('frontend-')) {
    return `${protocol}//${currentHost.replace(/^frontend-/, 'api-')}`;
  }
  
  // frontend.xxx -> api.xxx
  if (currentHost.startsWith('frontend.')) {
    return `${protocol}//${currentHost.replace(/^frontend\./, 'api.')}`;
  }
  
  // Contém 'frontend' ou 'front' -> substituir por 'api'
  if (currentHost.includes('frontend')) {
    return `${protocol}//${currentHost.replace('frontend', 'api')}`;
  }
  if (currentHost.includes('front')) {
    return `${protocol}//${currentHost.replace('front', 'api')}`;
  }
  
  return '';
};

// Criar instância do axios COM baseURL definida imediatamente
const api = axios.create({
  baseURL: getApiUrl(),
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('goapi_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('goapi_token');
      localStorage.removeItem('goapi_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
