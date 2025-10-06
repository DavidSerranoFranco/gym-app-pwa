// frontend/src/pages/RegisterPage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Datos de Registro:', formData);
    // Próximamente: aquí enviaremos los datos al backend para crear el usuario
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h1>
        <form onSubmit={handleSubmit}>
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
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Registrarse
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-bold text-blue-500 hover:text-blue-800">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}