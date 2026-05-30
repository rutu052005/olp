import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('learnsphere_token') || null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('learnsphere_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const res = await authApi.me();
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to load user on mount:', err);
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { user: loggedUser, token: authToken } = res.data;
      localStorage.setItem('learnsphere_token', authToken);
      setToken(authToken);
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password, role });
      const { user: registeredUser, token: authToken } = res.data;
      localStorage.setItem('learnsphere_token', authToken);
      setToken(authToken);
      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
