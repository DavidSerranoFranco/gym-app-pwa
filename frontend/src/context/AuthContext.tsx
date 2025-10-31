import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  user: DecodedToken | null;
  login: (accessToken: string) => void;
  logout: () => void;
}

interface DecodedToken {
  id: string;
  name: string;
  role: 'ADMIN' | 'CLIENT';
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Al cargar la app, revisa si hay un token en localStorage
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      const decodedUser = jwtDecode<DecodedToken>(storedToken);
      setToken(storedToken);
      setUser(decodedUser);
    }
  }, []);

  const login = (accessToken: string) => {
    const decodedUser = jwtDecode<DecodedToken>(accessToken);
    localStorage.setItem('authToken', accessToken);
    setToken(accessToken);
    setUser(decodedUser);

    // Redirige según el rol
    if (decodedUser.role === 'ADMIN') {
      navigate('/admin/memberships');
    } else {
      navigate('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    navigate('/'); // Redirige a la página de inicio
  };

  const value = { token, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}