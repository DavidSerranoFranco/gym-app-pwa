import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // 1. Buscamos el 'token' en la URL (ej: ...?token=eyJh...)
    const token = searchParams.get('token');

    if (token) {
      // 2. Si hay token, llamamos a la función 'login' del AuthContext
      // Esta función (actualizada) guarda el token, pide el perfil y redirige.
      login(token);
    } else {
      // 3. Si no hay token, hubo un error. Redirigimos al login.
      alert('Error en el inicio de sesión con Google. Inténtalo de nuevo.');
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center">
        <p className="text-2xl font-semibold text-gray-700">
          Procesando tu inicio de sesión...
        </p>
        {/* Aquí iría un componente de Spinner/Loading */}
      </div>
    </div>
  );
}