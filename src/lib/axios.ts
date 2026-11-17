import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./auth-token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

// Cold start listener support
type ColdStartCallback = (isWakingUp: boolean) => void;
const coldStartListeners = new Set<ColdStartCallback>();

export const subscribeColdStart = (cb: ColdStartCallback): (() => void) => {
  coldStartListeners.add(cb);
  return () => coldStartListeners.delete(cb);
};

const notifyColdStart = (isWakingUp: boolean) => {
  coldStartListeners.forEach((cb) => cb(isWakingUp));
};

let activeColdTimers = 0;

// Request interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Monitor request time for cold start notice (>3s)
  const timer = setTimeout(() => {
    activeColdTimers++;
    notifyColdStart(true);
  }, 3000);

  // Store timer on config to clear upon completion
  (config as unknown as { _coldTimer: NodeJS.Timeout })._coldTimer = timer;

  return config;
});

// Refresh queue management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const timer = (response.config as unknown as { _coldTimer?: NodeJS.Timeout })._coldTimer;
    if (timer) {
      clearTimeout(timer);
      if (activeColdTimers > 0) {
        activeColdTimers--;
        if (activeColdTimers === 0) notifyColdStart(false);
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _coldTimer?: NodeJS.Timeout;
    };

    if (originalRequest?._coldTimer) {
      clearTimeout(originalRequest._coldTimer);
      if (activeColdTimers > 0) {
        activeColdTimers--;
        if (activeColdTimers === 0) notifyColdStart(false);
      }
    }

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    // On 401 unauthenticated, attempt a single refresh
    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<{ accessToken: string }>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        setAccessToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        clearAccessToken();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = "/login?session=expired";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: { message?: string } } | undefined;
    if (data?.error?.message) {
      return data.error.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}
