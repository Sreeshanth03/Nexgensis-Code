import axios from "axios";
import { ApiError } from "./api-error";
import { clearAuth, getToken } from "./auth-storage";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const delay = process.env.NEXT_PUBLIC_DUMMYJSON_DELAY;
  if (delay) {
    config.params = { ...config.params, delay };
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status: number | undefined = error.response?.status;
    const message: string =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    if (status === 401 && typeof window !== "undefined") {
      clearAuth();
      if (!window.location.pathname.startsWith("/login")) {
        // Axios interceptors are outside React; App Router is not available here.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
      }
    }

    return Promise.reject(new ApiError(message, status));
  },
);

export default api;
