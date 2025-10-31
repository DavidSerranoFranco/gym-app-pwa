import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Input from '../components/Input';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Solo necesitamos la función 'login' del contexto.
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', formData);
      if (response.data.accessToken) {
        // Le pasamos el token a la función 'login' y ella se encarga de todo lo demás.
        login(response.data.accessToken);
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      alert('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle={
        <span>
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-bold text-orange-600 hover:text-orange-800 transition-colors">
            Regístrate Ahora
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Correo Electrónico"
          type="email"
          name="email"
          placeholder="tu.correo@ejemplo.com"
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50 transition-all duration-300 shadow-lg"
        >
          Ingresar
        </button>
      </form>
    </AuthLayout>
  );
}