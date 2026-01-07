import axios from 'axios';

// Criar instância do axios SEM baseURL inicial
const api = axios.create();

// Flag para saber se já carregou a config do servidor
let configLoaded = false;
let configPromise: Promise<void> | null = null;
let apiBaseUrl = '';

// Função para detectar URL da API baseado no hostname (fallback apenas para domínios)
const detectApiUrl = (): string => {
  if (typeof window === 'undefined') return '';
  
  const currentHost = window.location.hostname;
  const protocol = window.location.protocol;
  
  // NUNCA usar IP direto - sempre retornar vazio para forçar uso da config
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(currentHost)) {
    return ''; // Forçar carregar config do servidor
  }
  
  // Se estiver em localhost, usar localhost
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // Se estiver em frontend-xxx ou front-xxx, trocar para api-xxx
  if (currentHost.startsWith('frontend-')) {
    return `${protocol}//${currentHost.replace(/^frontend-/, 'api-')}`;
  }
  if (currentHost.startsWith('front-')) {
    return `${protocol}//${currentHost.replace(/^front-/, 'api-')}`;
  }
  
  // Se estiver em frontend.xxx, trocar para api.xxx
  if (currentHost.startsWith('frontend.')) {
    return `${protocol}//${currentHost.replace(/^frontend\./, 'api.')}`;
  }
  
  // Se hostname contém 'frontend' ou 'front', substituir por 'api'
  if (currentHost.includes('frontend')) {
    return `${protocol}//${currentHost.replace('frontend', 'api')}`;
  }
  if (currentHost.includes('front')) {
    return `${protocol}//${currentHost.replace('front', 'api')}`;
  }
  
  return '';
};

// Função para carregar a config do servidor (PRIORIDADE sobre detecção)
const loadConfig = async () => {
  if (configLoaded) return;
  if (configPromise) return configPromise;

  configPromise = (async () => {
    try {
      const res = await fetch('/api/config');
      const config = await res.json();
      
      // SEMPRE usar a config do servidor se disponível
      if (config.apiUrl && config.apiUrl.trim() !== '') {
        apiBaseUrl = config.apiUrl;
        api.defaults.baseURL = config.apiUrl;
      } else {
        // Fallback para detecção automática (apenas domínios, nunca IP)
        const detected = detectApiUrl();
        if (detected) {
          apiBaseUrl = detected;
          api.defaults.baseURL = detected;
        }
      }
    } catch {
      // Se falhar ao carregar config, tentar detecção automática
      const detected = detectApiUrl();
      if (detected) {
        apiBaseUrl = detected;
        api.defaults.baseURL = detected;
      }
    }
    configLoaded = true;
  })();

  return configPromise;
};

// Interceptor para garantir que a config foi carregada ANTES de cada request
api.interceptors.request.use(async (config) => {
  // SEMPRE carregar config primeiro
  if (typeof window !== 'undefined' && !configLoaded) {
    await loadConfig();
  }

  // Adicionar token de autenticação
  const token = typeof window !== 'undefined' ? localStorage.getItem('goapi_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se 401, limpar token e redirecionar para login
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
