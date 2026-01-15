import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authApi } from "../api/auth";
import { getTokens, setTokens, clearTokens } from "../api/client";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем наличие токена при загрузке
    const { accessToken } = getTokens();
    setIsAuthenticated(!!accessToken);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password });
      setTokens(response.access, response.refresh);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
