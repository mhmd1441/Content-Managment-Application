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
export const login  = (data) => api.post('/login', data);
export const register = (data) => api.post('/register', data);
export const me     = () => api.get('/api/me');
export const logout = () => api.post('/logout');
export const getMenus = () => api.get('/api/get_menus');
export const show_menu = (id) => api.get(`/api/get_menus/${id}`);
export const get_contentSections   = () => api.get('/api/get_contentSections');
export const show_contentSection   = (id) => api.get(`/api/show_contentSection/${id}`);
export const get_departments = () => api.get('/api/get_departments');
export const get_users = () => api.get('/api/get_users');
export const show_user   = (id) => api.get(`/api/show_user/${id}`);
export const save_user   = (payload)        => api.post('/api/save_user', payload);
export const update_user = (id, payload)    => api.put(`/api/update_user/${id}`, payload);
export const delete_user = (id)             => api.delete(`/api/delete_user/${id}`);



/* 
export const get_menu_children = (id) => api.get(`/api/menus/${id}/children`);
export const get_menu_contents = (id) => api.get(`/api/menus/${id}/content-sections`);
*/
