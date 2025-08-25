import type { AuthProvider } from "@refinedev/core";
import axios from "axios";

export const TOKEN_KEY = "token";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email,
          password,
        },
      );
      const { token } = res.data.user;
      try {
        const adminCheck = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/info`, 
          null, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        localStorage.setItem(TOKEN_KEY, token);
        
        return {
          success: true,
          redirectTo: "/",
          successNotification: {
            message: "Đăng nhập thành công",
            description: "Chào mừng bạn quay trở lại!",
          },
        };
      } catch (adminError: unknown) {
        if (axios.isAxiosError(adminError) && adminError.response?.status === 403) {
          return {
            success: false,
            error: {
              name: "PermissionError",
              message: "Tài khoản không có quyền truy cập admin. Vui lòng sử dụng tài khoản admin.",
            },
          };
        }
        
        return {
          success: false,
          error: {
            name: "AuthError",
            message: "Không thể xác thực quyền admin. Vui lòng thử lại.",
          },
        };
      }
    } catch (error: unknown) {
      let errorMessage = "Đăng nhập thất bại";
      
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        errorMessage = error.response.data.message || "Email hoặc mật khẩu không chính xác";
      } else if (axios.isAxiosError(error) && error.response?.status === 402) {
        errorMessage = "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực.";
      } else if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return {
        success: false,
        error: {
          name: "LoginError",
          message: errorMessage,
        },
      };
    }
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return {
        authenticated: false,
        redirectTo:"/login"
      };
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/info`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        authenticated: true,
      };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/info`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const admin = res.data;

      return {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar || "https://i.pravatar.cc/300",
      };
    } catch (error) {
      return null;
    }
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
