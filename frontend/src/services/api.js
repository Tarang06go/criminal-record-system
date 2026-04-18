import axios from "axios";
import { clearAuthSession, getToken } from "./auth";

const api = axios.create({
  baseURL: "https://criminal-record-system-tybr.onrender.com/api",
  timeout: 15000,
});

// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = getToken(); // ✅ FIXED

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ RESPONSE INTERCEPTOR (FIXED)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();

      // ❌ REMOVE window.location.href
      // ✅ Let React Router handle redirect
    }

    return Promise.reject(error);
  }
);

// ✅ ERROR HANDLER
export function getApiErrorMessage(error, fallbackMessage) {
  return (
    error.response?.data?.message ||
    error.message ||
    fallbackMessage ||
    "Something went wrong."
  );
}

export default api;