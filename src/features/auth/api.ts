import { apiClient } from "@/lib/axios";
import { LoginCredentials, LoginResponse, RefreshResponse, User } from "@/types/auth";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>("/auth/login", credentials);
    return res.data;
  },

  refresh: async (): Promise<RefreshResponse> => {
    const res = await apiClient.post<RefreshResponse>("/auth/refresh");
    return res.data;
  },

  logout: async (): Promise<{ message?: string }> => {
    const res = await apiClient.post<{ message?: string }>("/auth/logout");
    return res.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await apiClient.get<{ user: User }>("/auth/me");
    return res.data;
  },
};
