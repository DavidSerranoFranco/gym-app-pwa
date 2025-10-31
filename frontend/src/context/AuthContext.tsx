import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importamos axios

// --- 1. Definimos una interfaz de Usuario completa ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  address: string;
  phone: string;
  profilePictureUrl: string;
  points: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null; // El estado 'user' ahora contendrá el perfil completo
  login: (accessToken: string) => void;
  logout: () => void;
  updateUserState: (updatedUser: User) => void; // <-- Función para actualizar el perfil
}

// Token decodificado (solo para la info básica)
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
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // --- 2. Efecto de carga mejorado ---
  useEffect(() => {
    const loadUserFromToken = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          // 1. Decodificamos el token (como antes)
          jwtDecode<DecodedToken>(storedToken); 
          setToken(storedToken);

          // 2. Pedimos el perfil completo al backend
          const response = await axios.get('http://localhost:5000/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          
          // 3. Guardamos el perfil completo en el estado
          setUser(response.data);

        } catch (error) {
          // Si el token es inválido o da error, limpiamos todo
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
      // 1. Guardamos el token
      localStorage.setItem('authToken', accessToken);
      setToken(accessToken);

      // 2. Pedimos el perfil completo
      const response = await axios.get('http://localhost:5000/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // 3. Guardamos el perfil y redirigimos
      const fullUser: User = response.data;
      setUser(fullUser);

      if (fullUser.role === 'ADMIN') {
        navigate('/admin/memberships');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error en el proceso de login:", error);
      logout(); // Si falla al obtener el perfil, desloguear
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  // --- 3. Nueva función para actualizar el estado ---
  const updateUserState = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = { token, user, login, logout, updateUserState };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}