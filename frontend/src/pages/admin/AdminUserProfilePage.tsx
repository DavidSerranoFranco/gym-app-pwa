import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// --- Definimos las interfaces para los datos completos ---
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
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
// --------------------------------------------------------

export default function AdminUserProfilePage() {
  const { id } = useParams<{ id: string }>(); // Obtiene el ID del usuario desde la URL
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

  // Funciones helpers para formatear fechas
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES');
  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleString('es-ES');
  };

  if (loading) return <p>Cargando perfil del usuario...</p>;
  if (!profile) return <p>No se encontró el perfil del usuario.</p>;

  return (
    <div className="space-y-8">
      <Link to="/admin/users" className="text-orange-600 hover:underline">&larr; Volver a la lista de usuarios</Link>
      
      {/* 1. Tarjeta de Información del Usuario */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">{profile.user.name}</h1>
        <p className="text-lg text-gray-600">{profile.user.email}</p>
        <p className="text-sm text-gray-400">Miembro desde: {formatDate(profile.user.createdAt)}</p>
      </div>

      {/* 2. Historial de Membresías */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Membresías</h2>
        <table className="min-w-full">
          <thead>
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

      {/* 3. Historial de Reservas */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Reservas</h2>
        <table className="min-w-full">
          <thead>
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
                <td className="py-2 px-3">{book.schedule.location.name}</td>
                <td className="py-2 px-3">{book.schedule.startTime} - {book.schedule.endTime}</td>
                <td className="py-2 px-3">{book.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Historial de Acceso (Check-ins) */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Acceso</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-3 text-left">Sucursal</th>
              <th className="py-2 px-3 text-left">Hora de Entrada</th>
              <th className="py-2 px-3 text-left">Hora de Salida</th>
            </tr>
          </thead>
          <tbody>
            {profile.checkIns.map(ci => (
              <tr key={ci._id} className="border-t">
                <td className="py-2 px-3">{ci.location.name}</td>
                <td className="py-2 px-3">{formatDateTime(ci.checkInTime)}</td>
                <td className="py-2 px-3">{formatDateTime(ci.checkOutTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}