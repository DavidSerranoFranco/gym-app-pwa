import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Input from '../components/Input';
import AuthLayout from '../components/AuthLayout';

// --- AQUÍ ESTÁ LA CORRECCIÓN ---
// Se importa 'Gender' desde el AuthContext (frontend)
// en lugar del backend.
import { Gender } from '../context/AuthContext'; 

// Lista de estados de México para el dropdown
const mexicanStates = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", 
  "Chiapas", "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", 
  "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos", 
  "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", 
  "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", 
  "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    paternalLastName: '',
    maternalLastName: '',
    email: '',
    password: '',
    gender: Gender.MALE, // Valor por defecto
    state: '',
    age: 18,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      // Maneja 'number' para la edad, y 'string' para todo lo demás
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      await axios.post('http://localhost:5000/auth/register', formData);
      setMessage('¡Registro exitoso! Revisa tu correo electrónico para verificar tu cuenta.');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const msg = err.response.data.message || 'Error en el registro.';
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        setError('Hubo un error al intentar registrarte.');
      }
    } finally {
      setIsLoading(false);
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
      {message ? (
        <div className="text-center p-4 bg-green-100 text-green-700 rounded-md">
          <h3 className="font-bold text-lg mb-2">¡Revisa tu correo!</h3>
          <p>{message}</p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <Input
              label="Nombre(s)"
              type="text"
              name="firstName"
              placeholder="Ej. David"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Apellido Paterno"
                type="text"
                name="paternalLastName"
                placeholder="Ej. Franco"
                value={formData.paternalLastName}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido Materno (Opcional)"
                type="text"
                name="maternalLastName"
                placeholder="Ej. Rivas"
                value={formData.maternalLastName}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Género</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value={Gender.MALE}>Masculino</option>
                  <option value={Gender.FEMALE}>Femenino</option>
                  <option value={Gender.OTHER}>Otro</option>
                </select>
              </div>
              <Input
                label="Edad"
                type="number"
                name="age"
                placeholder="18"
                value={formData.age.toString()} // El input de tipo 'number' maneja strings
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Selecciona tu estado</option>
                {mexicanStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <Input
              label="Correo Electrónico"
              type="email"
              name="email"
              placeholder="tu.correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !!message} 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50 transition-all duration-300 shadow-lg disabled:bg-gray-400"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          {/* Divisor y botón de Google */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O regístrate con</span>
              </div>
            </div>
            <div className="mt-6">
              <a
                href="http://localhost:5000/auth/google"
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {/* --- FIN DE LA CORRECCIÓN --- */}
                <span>Registrarse con Google</span>
              </a>
            </div>
          </div>
        </>
      )}
    </AuthLayout>
  );
}