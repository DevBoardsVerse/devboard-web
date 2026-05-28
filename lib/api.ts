import axios from "axios";
import { useAuthStore } from "@/store/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // ✅ KEY FIX: if the failed request IS the refresh endpoint,
    // don't try to refresh again — just reject and let the layout handle it
    if (original.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // ✅ KEY FIX: if there's no token in store at all, the layout is still
    // doing its initial silent refresh — don't interfere, just queue/reject
    const currentToken = useAuthStore.getState().accessToken;
    if (!currentToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const payload = data?.data ?? data;
      const newToken = payload.accessToken;
      useAuthStore.getState().setAuth(newToken, payload.user);
      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);