// In-memory access token storage (never localStorage/sessionStorage to prevent XSS)
let memoryAccessToken: string | null = null;
type AuthChangeListener = (token: string | null) => void;
const listeners = new Set<AuthChangeListener>();

export const getAccessToken = (): string | null => {
  return memoryAccessToken;
};

export const setAccessToken = (token: string | null): void => {
  memoryAccessToken = token;
  listeners.forEach((listener) => listener(token));
};

export const clearAccessToken = (): void => {
  memoryAccessToken = null;
  listeners.forEach((listener) => listener(null));
};

export const subscribeAuthChange = (listener: AuthChangeListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
