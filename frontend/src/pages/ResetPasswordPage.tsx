import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 1. Importar useLocation
import axios, { AxiosError } from 'axios';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation(); // 2. Hook para leer el 'state'

  // 3. El email se rellena automáticamente desde la página anterior
  const initialEmail = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: initialEmail,
    code: '',
    newPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 4. Si el usuario llega aquí sin email, lo regresamos
  useEffect(() => {
    if (!initialEmail) {
      alert('Primero debes solicitar un código desde la página "Olvidé mi contraseña".');
      navigate('/forgot-password');
    }
  }, [initialEmail, navigate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/auth/reset-password', formData);
      setMessage(response.data.message + " Serás redirigido al login.");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || 'Error al procesar la solicitud.';
      setError(msg);
      setIsLoading(false); // Detener solo si hay error
    }
  };

  return (
    <AuthLayout
      title="Crear Nueva Contraseña"
      subtitle="Ingresa el código que recibiste y tu nueva contraseña."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          id="email"
          name="email"
          placeholder="tu.correo@ejemplo.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Código de 6 dígitos"
          type="text"
          id="code"
          name="code"
          placeholder="123456"
          value={formData.code}
          onChange={handleChange}
          required
        />
        <Input
          label="Nueva Contraseña"
          type="password"
          id="newPassword"
          name="newPassword"
          placeholder="••••••••"
          value={formData.newPassword}
          onChange={handleChange}
          required
        />
        
        {message && (
          <div className="text-sm text-center p-3 rounded-md bg-green-100 text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="text-sm text-center p-3 rounded-md bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !!message}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50 transition-all duration-300 shadow-lg"
        >
          {isLoading ? 'Actualizando...' : 'Restablecer Contraseña'}
        </button>
      </form>
    </AuthLayout>
  );
}