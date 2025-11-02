import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../components/AuthLayout';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setMessage('Error: No se proporcionó un token de verificación.');
        setIsLoading(false);
        return;
      }

      try {
        // Llamamos al endpoint del backend que creamos
        const response = await axios.get(
          `http://localhost:5000/auth/verify-email?token=${token}`
        );
        setMessage(response.data.message);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setMessage(error.response.data.message || 'Error al verificar el correo.');
        } else {
          setMessage('Ocurrió un error inesperado.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const getMessageContent = () => {
    if (isLoading) {
      return <p className="text-gray-700">Verificando tu correo...</p>;
    }
    
    if (message?.includes('Error')) {
      return (
        <>
          <p className="text-red-600 mb-4">{message}</p>
          <Link to="/login" className="text-orange-600 hover:underline">
            Volver a Iniciar Sesión
          </Link>
        </>
      );
    }
    
    return (
      <>
        <p className="text-green-600 mb-4">{message}</p>
        <Link 
          to="/login" 
          className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg"
        >
          ¡Genial! Ir a Iniciar Sesión
        </Link>
      </>
    );
  };

  return (
    <AuthLayout
      title="Verificación de Correo"
      subtitle="Espera un momento mientras validamos tu cuenta."
    >
      <div className="text-center">
        {getMessageContent()}
      </div>
    </AuthLayout>
  );
}