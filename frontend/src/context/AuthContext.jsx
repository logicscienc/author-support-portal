
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { AuthContext } from "./auth-context";

import {
  loginRequest,
  getCurrentUser,
} from "../api/auth.api";


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the login when the page reloads within the same tab session.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const savedToken = sessionStorage.getItem("token");

      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      setToken(savedToken);

      try {
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        if (!cancelled) {
          if (error.status === 401) {
            sessionStorage.removeItem("token");
            setToken(null);
          }

          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await loginRequest(credentials);

    sessionStorage.setItem("token", result.token);
    setToken(result.token);
    setUser(result.user);

    return result.user;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


