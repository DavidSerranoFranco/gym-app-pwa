// frontend/src/pages/RegisterPage.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '../components/Input';
import AuthLayout from '../components/AuthLayout'; // <-- Importa el AuthLayout

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/auth/register', formData);
      alert('Registro exitoso. ¡Ahora puedes iniciar sesión!');
      navigate('/login');
    } catch (error) {
      console.error('Error en el registro:', error);
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        alert('El correo electrónico ya está registrado.');
      } else {
        alert('Hubo un error al intentar registrarte.');
      }
    }
  };

  return (
    <AuthLayout
      title="Crear Cuenta"
      subtitle={
        <span>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:text-orange-800 transition-colors">
            Inicia Sesión
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre Completo"
          type="text"
          name="name"
          placeholder="Ej. David Rivas"
          value={formData.name}
          onChange={handleChange}
        />
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
          Registrarse
        </button>
      </form>
    </AuthLayout>
  );
}