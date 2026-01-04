import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Token } from "../types";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查本地存储中的认证信息
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // 验证token是否仍然有效
          await authAPI.getMe();
        } catch (error) {
          // Token无效，清除本地存储
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setIsLoading(true);
      const response: Token = await authAPI.login({
        email,
        password,
        remember_me: rememberMe,
      });

      // 保存认证信息到本地存储
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setToken(response.access_token);
      setUser(response.user);

      toast.success("登录成功");
    } catch (error: any) {
      const message = error.response?.data?.detail || "登录失败";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // 即使API调用失败，也要清除本地状态
      console.warn("Logout API call failed:", error);
    } finally {
      // 清除本地存储和状态
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      toast.success("已登出");
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authAPI.getMe();
      setUser(currentUser);
      localStorage.setItem("user", JSON.stringify(currentUser));
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("个人资料更新成功");
    } catch (error: any) {
      const message = error.response?.data?.detail || "更新失败";
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("密码修改成功");
    } catch (error: any) {
      const message = error.response?.data?.detail || "密码修改失败";
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
