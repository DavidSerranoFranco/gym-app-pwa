import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth, Gender } from '../../context/AuthContext'; // <-- 1. Importar Gender

// --- 2. INTERFACES ACTUALIZADAS ---
interface User {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
  
  // Campos actualizados
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  gender: Gender | null;
  state: string | null;
  age: number | null;
  
  // Campos existentes
  profilePictureUrl: string | null;
  address: string;
  phone: string;
  points: number;
}

interface UserMembership {
  _id:string;
  membership: { name: string };
  startDate: string;
  endDate: string;
  classesRemaining: number;
  status: string;
}

interface Booking {
  _id: string;
  bookingDate: string;
  status: string;
  schedule: {
    startTime: string;
    endTime: string;
    location: { name: string };
  };
}

interface CheckIn {
  _id: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: string;
  location: { name: string };
}

interface UserProfile {
  user: User;
  memberships: UserMembership[];
  bookings: Booking[];
  checkIns: CheckIn[];
}
// --------------------

export default function AdminUserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token || !id) return;
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        alert('No se pudo cargar el perfil del usuario.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, token]);

  // Funciones helpers
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES');
  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleString('es-ES');
  };
  // 3. Helper para mostrar datos
  const show = (data: string | number | null | undefined) => data || 'No especificado';

  if (loading) return <p>Cargando perfil del usuario...</p>;
  if (!profile) return <p>No se encontró el perfil del usuario.</p>;

  // 4. URL de imagen y nombre ACTUALIZADOS
  const welcomeName = `${profile.user.firstName} ${profile.user.paternalLastName}`;
  const profileImageUrl = profile.user.profilePictureUrl
    ? `http://localhost:5000${profile.user.profilePictureUrl}`
    : `https://ui-avatars.com/api/?name=${welcomeName.replace(' ', '+')}&background=F97316&color=fff`;

  return (
    <div className="space-y-8">
      <Link to="/admin/users" className="text-orange-600 hover:underline">&larr; Volver a la lista de usuarios</Link>
      
      {/* --- 5. TARJETA DE PERFIL (ACTUALIZADA) --- */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row items-center md:space-x-6">
          <img
            src={profileImageUrl}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full object-cover mb-4 md:mb-0"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">{welcomeName}</h1>
            <p className="text-lg text-gray-600">{show(profile.user.maternalLastName)}</p>
            <p className="text-sm text-gray-400">Miembro desde: {formatDate(profile.user.createdAt)}</p>
          </div>
          <div className="text-center bg-gray-50 p-4 rounded-lg mt-4 md:mt-0">
            <div className="text-4xl font-bold text-orange-500">{profile.user.points}</div>
            <div className="text-sm font-semibold text-gray-500">Puntos</div>
          </div>
        </div>
        
        {/* --- 6. SECCIÓN DE DATOS PERSONALES (ACTUALIZADA) --- */}
        <div className="mt-6 border-t pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="text-lg text-gray-800">{profile.user.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
            <p className="text-lg text-gray-800">{show(profile.user.phone)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
            <p className="text-lg text-gray-800">{show(profile.user.address)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Estado</h3>
            <p className="text-lg text-gray-800">{show(profile.user.state)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Edad</h3>
            <p className="text-lg text-gray-800">{show(profile.user.age)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Género</h3>
            <p className="text-lg text-gray-800">{show(profile.user.gender)}</p>
          </div>
        </div>
      </div>

      {/* 2. Historial de Membresías (sin cambios) */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Membresías</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 text-left">Plan</th>
                <th className="py-2 px-3 text-left">Clases Restantes</th>
                <th className="py-2 px-3 text-left">Estado</th>
                <th className="py-2 px-3 text-left">Fecha de Fin</th>
              </tr>
            </thead>
            <tbody>
              {profile.memberships.map(mem => (
                <tr key={mem._id} className="border-t">
                  <td className="py-2 px-3">{mem.membership.name}</td>
                  <td className="py-2 px-3">{mem.classesRemaining}</td>
                  <td className="py-2 px-3">{mem.status}</td>
                  <td className="py-2 px-3">{formatDate(mem.endDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Historial de Reservas (sin cambios) */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Reservas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 text-left">Fecha de Clase</th>
                <th className="py-2 px-3 text-left">Sucursal</th>
                <th className="py-2 px-3 text-left">Horario</th>
                <th className="py-2 px-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {profile.bookings.map(book => (
                <tr key={book._id} className="border-t">
                  <td className="py-2 px-3">{formatDate(book.bookingDate)}</td>
                  <td className="py-2 px-3">{book.schedule?.location?.name || 'N/A'}</td>
                  <td className="py-2 px-3">{book.schedule?.startTime || 'N/A'} - {book.schedule?.endTime || 'N/A'}</td>
                  <td className="py-2 px-3">{book.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Historial de Acceso (Check-ins) (sin cambios) */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Acceso</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 text-left">Sucursal</th>
                <th className="py-2 px-3 text-left">Hora de Entrada</th>
                <th className="py-2 px-3 text-left">Hora de Salida</th>
              </tr>
            </thead>
            <tbody>
              {profile.checkIns.map(ci => (
                <tr key={ci._id} className="border-t">
                  <td className="py-2 px-3">{ci.location?.name || 'N/A'}</td>
                  <td className="py-2 px-3">{formatDateTime(ci.checkInTime)}</td>
                  <td className="py-2 px-3">{formatDateTime(ci.checkOutTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}