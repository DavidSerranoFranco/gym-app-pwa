import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth, type User } from '../context/AuthContext';
import axios, { AxiosError } from 'axios';
import { Link } from 'react-router-dom';

export default function ClientProfilePage() {
  const { user, token, updateUserState } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    address: user?.address || '',
    phone: user?.phone || '',
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Enviar el formulario de texto
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
      // --- CORRECCIÓN AQUÍ ---
      // Se usa AxiosError para leer el mensaje del backend
      const err = error as AxiosError<{ message: string | string[] }>;
      let message = 'Error al actualizar el perfil';
      if (err.response?.data?.message) {
        // Si el mensaje es un array (del class-validator), toma el primero
        message = Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message;
      }
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar la foto de perfil
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
      // --- CORRECCIÓN AQUÍ ---
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message || 'Error al subir la foto. Asegúrate de que sea una imagen.';
      alert(message);
    } finally {
      setIsUploading(false);
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
    : `https://ui-avatars.com/api/?name=${user.name}&background=F97316&color=fff`;

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
              <h2 className="text-2xl font-bold">{user.name}</h2>
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

          {/* Columna 2: Información del Perfil */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmitInfo} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Información de Contacto</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-4 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-300"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}