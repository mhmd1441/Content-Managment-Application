import axios from "axios";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost");

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

export const initCsrf = () => api.get("/sanctum/csrf-cookie");
export const login = (data) => api.post("/login", data);
export const register = (data) => api.post("/register", data);
export const me = () => api.get("/api/me");
export const logout = () => api.post("/logout");

export const get_users = () => api.get("/api/get_users");
export const show_user = (id) => api.get(`/api/show_user/${id}`);
export const save_user = (payload) => api.post("/api/save_user", payload);
export const update_user = (id, payload) =>api.put(`/api/update_user/${id}`, payload);
export const delete_user = (id) => api.delete(`/api/delete_user/${id}`);
export const get_new_users = () => api.get("/api/get_new_users");
export const get_total_users = () => api.get("/api/get_total_users");


export const getMenus = () => api.get("/api/get_menus");
export const show_menu = (id) => api.get(`/api/get_menus/${id}`);
export const save_menu = (payload) => api.post("/api/save_menu", payload);
export const update_menu = (id, payload) => api.put(`/api/update_menu/${id}`, payload);
export const delete_menu = (id) => api.delete(`/api/delete_menu/${id}`);
export const get_new_menus = () => api.get("/api/get_new_menus");
export const get_total_menus = () => api.get("/api/get_total_menus");


export const get_contentSections = () => api.get("/api/get_contentSections");
export const save_contentSection = (payload) =>api.post("/api/save_contentSection", payload);
export const show_contentSection = (id) =>api.get(`/api/show_contentSection/${id}`);
export const update_contentSection = (id, payload) => api.put(`/api/update_contentSection/${id}`, payload);
export const delete_contentSection = (id) => api.delete(`/api/delete_contentSection/${id}`);


export const get_departments = () => api.get("/api/get_departments");
export const save_department = (payload) =>api.post("/api/save_department", payload);
export const show_department = (id) => api.get(`/api/show_department/${id}`);
export const update_department = (id, payload) => api.put(`/api/update_department/${id}`, payload);
export const delete_department = (id) => api.delete(`/api/delete_department/${id}`);

