import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth, type User, Gender } from '../context/AuthContext';
import axios, { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import Input from '../components/Input';

// Lista de estados de México
const mexicanStates = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", 
  "Chiapas", "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", 
  "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos", 
  "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", 
  "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", 
  "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

export default function ClientProfilePage() {
  const { user, token, updateUserState } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    paternalLastName: user?.paternalLastName || '',
    maternalLastName: user?.maternalLastName || '',
    age: user?.age || 18,
    gender: user?.gender || Gender.MALE,
    state: user?.state || '',
    address: user?.address || '',
    phone: user?.phone || '',
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- 'handleChange' CORREGIDO ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // 1. 'type' se extrae aquí
    const { name, value, type } = e.target;
    
    // 2. 'type' se USA aquí (en lugar de e.target.type)
    const val = type === 'number' 
      ? parseInt(value) || 0 
      : value;

    setFormData({
      ...formData, [name]: val,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Submit de Info
  const handleSubmitInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await axios.patch(
        'http://localhost:5000/auth/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      updateUserState(response.data as User);
      alert('Perfil actualizado con éxito');
    } catch (error) {
      const err = error as AxiosError<{ message: string | string[] }>;
      let message = 'Error al actualizar el perfil';
      if (err.response?.data?.message) {
        message = Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message;
      }
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit de Foto
  const handleSubmitPicture = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;

    setIsUploading(true);
    const pictureFormData = new FormData();
    pictureFormData.append('file', file);

    try {
      const response = await axios.patch(
        'http://localhost:5000/auth/profile/picture',
        pictureFormData,
        { headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        }}
      );
      
      updateUserState(response.data as User);
      alert('Foto de perfil actualizada');
      setFile(null);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message || 'Error al subir la foto. Asegúrate de que sea una imagen.';
      alert(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Manejadores de Contraseña
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitPassword = async (e: FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMessage(null);
    setPassError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassError('Las nuevas contraseñas no coinciden.');
      setPassLoading(false);
      return;
    }
    
    if (!token) return;

    try {
      const response = await axios.patch(
        'http://localhost:5000/auth/profile/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPassMessage(response.data.message);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || 'Error al cambiar la contraseña.';
      setPassError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setPassLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>Cargando perfil...</p>
        <Link to="/login" className="text-orange-600">Iniciar Sesión</Link>
      </div>
    );
  }

  const profileImageUrl = user.profilePictureUrl
    ? `http://localhost:5000${user.profilePictureUrl}`
    : `https://ui-avatars.com/api/?name=${user.firstName}+${user.paternalLastName}&background=F97316&color=fff`;

  const welcomeName = `${user.firstName} ${user.paternalLastName}`;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-orange-600 hover:underline mb-4 inline-block">&larr; Volver al Dashboard</Link>
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Mi Perfil</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Columna 1: Foto de Perfil */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <img
                src={profileImageUrl}
                alt="Foto de perfil"
                className="w-40 h-40 rounded-full mx-auto mb-4 object-cover"
              />
              <h2 className="text-2xl font-bold">{welcomeName}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
            
            <form onSubmit={handleSubmitPicture} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-2">Cambiar Foto</h3>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              <button 
                type="submit" 
                disabled={!file || isUploading}
                className="w-full mt-4 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-300"
              >
                {isUploading ? 'Subiendo...' : 'Guardar Foto'}
              </button>
            </form>
          </div>

          {/* Columna 2: Formularios de Información */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <form onSubmit={handleSubmitInfo} className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Información Personal</h2>
                
                <Input
                  label="Nombre(s)"
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Apellido Paterno"
                    type="text"
                    name="paternalLastName"
                    id="paternalLastName"
                    value={formData.paternalLastName}
                    onChange={handleChange}
                    placeholder="Tu apellido"
                    required
                  />
                  <Input
                    label="Apellido Materno"
                    type="text"
                    name="maternalLastName"
                    id="maternalLastName"
                    value={formData.maternalLastName}
                    onChange={handleChange}
                    placeholder="(Opcional)"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Edad"
                    type="number"
                    name="age"
                    id="age"
                    value={formData.age.toString()}
                    onChange={handleChange}
                    placeholder="18"
                    required
                  />
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Género</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value={Gender.MALE}>Masculino</option>
                      <option value={Gender.FEMALE}>Femenino</option>
                      <option value={Gender.OTHER}>Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state || ''}
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
                
                <h2 className="text-xl font-bold text-gray-800 pt-4">Información de Contacto</h2>
                <Input
                  label="Teléfono"
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ej. 33 1234 5678"
                />
                <Input
                  label="Dirección"
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Tu calle y número"
                />
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full mt-4 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-300"
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>

            {/* Tarjeta de Cambio de Contraseña (sin cambios) */}
            {!user.googleId && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleSubmitPassword} className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Cambiar Contraseña</h2>
                  
                  <Input
                    label="Contraseña Actual"
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                  />
                  <Input
                    label="Nueva Contraseña"
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                  />
                  <Input
                    label="Confirmar Nueva Contraseña"
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                  />

                  {passMessage && (
                    <div className="text-green-600 text-sm text-center">{passMessage}</div>
                  )}
                  {passError && (
                    <div className="text-red-600 text-sm text-center">{passError}</div>
                  )}
                  
                  <button 
                    type="submit" 
                    disabled={passLoading}
                    className="w-full mt-4 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-300"
                  >
                    {passLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}