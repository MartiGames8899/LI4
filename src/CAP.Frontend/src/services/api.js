import axios from 'axios';

// Instância base do Axios usando caminho relativo para o Nginx processar
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar o JWT a todos os pedidos (se existir no localStorage)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cap_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para lidar com respostas (ex: logout automático se token expirar)
api.interceptors.response.use(response => response, error => {
  if (error.response && error.response.status === 401) {
    // Redirecionar para login caso o token seja inválido
    localStorage.removeItem('cap_jwt_token');
    localStorage.removeItem('cap_user_role');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

export default api;
