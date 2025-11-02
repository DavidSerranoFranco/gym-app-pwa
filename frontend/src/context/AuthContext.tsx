import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- INTERFAZ 'Gender' ---
export const Gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER',
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

// --- 1. INTERFAZ 'User' ACTUALIZADA ---
export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  
  // Nuevos campos
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  gender: Gender | null;
  state: string | null;
  age: number | null;
  
  // Campos existentes
  address: string;
  phone: string;
  profilePictureUrl: string;
  points: number;
  googleId: string | null;
  isEmailVerified: boolean;
}

// --- 2. INTERFAZ 'DecodedToken' ACTUALIZADA ---
interface DecodedToken {
  id: string;
  name: string; // Esto es 'firstName'
  role: 'ADMIN' | 'CLIENT';
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (accessToken: string) => void;
  logout: () => void;
  updateUserState: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromToken = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          // 1. Decodificamos
          jwtDecode<DecodedToken>(storedToken); 
          setToken(storedToken);

          // 2. Pedimos el perfil completo (que ahora incluye todos los campos)
          const response = await axios.get('http://localhost:5000/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          
          setUser(response.data);

        } catch (error) {
          console.error("Error al cargar perfil desde token:", error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
    };

    loadUserFromToken();
  }, []);

  const login = async (accessToken: string) => {
    try {
      localStorage.setItem('authToken', accessToken);
      setToken(accessToken);

      // Pedimos el perfil completo
      const response = await axios.get('http://localhost:5000/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const fullUser: User = response.data;
      setUser(fullUser);

      // Redirigir
      if (fullUser.role === 'ADMIN') {
        navigate('/admin/memberships');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error en el proceso de login:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  const updateUserState = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = { token, user, login, logout, updateUserState };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}