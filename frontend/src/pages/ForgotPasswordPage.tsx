import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importar useNavigate
import axios, { AxiosError } from 'axios';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate(); // 2. Usar el hook

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await axios.post('http://localhost:5000/auth/forgot-password', {
        email,
      });
      
      // 3. Lógica de redirección
      setMessage(response.data.message + " Serás redirigido...");
      
      // Espera 2 segundos para que el usuario lea el mensaje
      setTimeout(() => {
        // Redirige a la página de reseteo Y pasa el email en el 'state'
        navigate('/reset-password', { state: { email: email } });
      }, 2000);

    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || 'Error al procesar la solicitud.';
      setMessage(msg);
      setIsLoading(false); // Solo detener si hay error
    }
    // No usamos 'finally' para que 'isLoading' se mantenga en 'true' durante la redirección
  };

  return (
    <AuthLayout
      title="Recuperar Contraseña"
      subtitle={
        <span>
          ¿Recordaste tu contraseña?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:text-orange-800 transition-colors">
            Inicia Sesión
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          id="email"
          name="email"
          placeholder="tu.correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        {message && (
          <div className={`text-sm text-center p-3 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading} // 4. Deshabilitado mientras carga o redirige
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50 transition-all duration-300 shadow-lg"
        >
          {isLoading ? 'Enviando...' : 'Enviar Código de Recuperación'}
        </button>
      </form>
    </AuthLayout>
  );
}