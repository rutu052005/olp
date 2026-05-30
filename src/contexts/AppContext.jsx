import { createContext, useContext, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const { user: currentUser, login, register, logout, loading: authLoading } = useAuth();
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      currentUser,
      login,
      register,
      logout,
      authLoading,
      toast,
      notify,
      mobileNav,
      setMobileNav,
    }),
    [theme, currentUser, login, register, logout, authLoading, toast, mobileNav]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
