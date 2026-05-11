// Small wrapper over localStorage so the rest of the app doesn't touch the
// browser API directly — easier to test, swap, or fall back if storage is
// disabled (private mode, embedded webviews).

const ACCESS_KEY = 'fi.accessToken';
const REFRESH_KEY = 'fi.refreshToken';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

const safeGet = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
};

const safeRemove = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export const tokenStorage = {
  read(): StoredTokens | null {
    const accessToken = safeGet(ACCESS_KEY);
    const refreshToken = safeGet(REFRESH_KEY);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },

  write(tokens: StoredTokens): void {
    safeSet(ACCESS_KEY, tokens.accessToken);
    safeSet(REFRESH_KEY, tokens.refreshToken);
  },

  clear(): void {
    safeRemove(ACCESS_KEY);
    safeRemove(REFRESH_KEY);
  },
};
