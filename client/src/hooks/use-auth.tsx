import { createContext, useState, useContext, useEffect } from "react";
import { apiRequest } from "../lib/api-request";

// إنشاء السياق مع القيم الافتراضية المناسبة لمنع أخطاء TypeScript
const AuthContext = createContext({
  user: null,
  login: async () => null,
  logout: async () => {},
  getCurrentUser: async () => {},
  isLoading: true
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username, password) => {
    try {
      const result = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      });
      setUser(result);
      return result;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getCurrentUser = async () => {
    try {
      setIsLoading(true);
      const user = await apiRequest("GET", "/api/auth/user");
      setUser(user);
      return user;
    } catch (error) {
      console.error("Get user error:", error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // محاولة الحصول على المستخدم الحالي عند تحميل التطبيق
  useEffect(() => {
    const initAuth = async () => {
      try {
        await getCurrentUser();
      } catch (error) {
        console.error("Initial auth error:", error);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, getCurrentUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);