import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export const initCsrf = () => api.get('/sanctum/csrf-cookie');

export const login = (data) => api.post('/login', data);
export const register = (data) => api.post('/register', data);
export const me = () => api.get('/api/me');
export const logout = () => api.post('/logout');
export const getMenus = () => api.get('/api/get_menus');
