import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token && storedUser !== "undefined") {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth initialization failed", error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const hasPermission = (requiredRoles) => {
    return user && requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
    
      {!loading ? children : (
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};