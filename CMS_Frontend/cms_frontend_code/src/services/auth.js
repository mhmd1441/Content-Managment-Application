import axios from "../lib/axios";

export const login = async (email, password) => {
  return axios.post("/login", { email, password });
};

export const register = async (formData) => {
  return axios.post("/register", formData);
};