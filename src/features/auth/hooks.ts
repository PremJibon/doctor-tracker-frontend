import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "./api";
import { LoginCredentials, User } from "@/types/auth";
import { setAccessToken, clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { getErrorMessage } from "@/lib/axios";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async (): Promise<User | null> => {
      // If we don't have an in-memory token yet, try a silent refresh first
      if (!getAccessToken()) {
        try {
          const refreshRes = await authApi.refresh();
          if (refreshRes.accessToken) {
            setAccessToken(refreshRes.accessToken);
          }
        } catch {
          // No active session cookie
          return null;
        }
      }

      try {
        const { user } = await authApi.getMe();
        return user;
      } catch {
        clearAccessToken();
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLoginMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      queryClient.setQueryData(authKeys.me(), data.user);
      toast.success("Welcome back!", {
        description: `Signed in as ${data.user.email}`,
      });
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error("Authentication failed", {
        description: getErrorMessage(error),
      });
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAccessToken();
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
      toast.info("Signed out successfully");
      router.push("/login");
    },
  });
}
