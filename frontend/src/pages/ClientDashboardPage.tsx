import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal'; // Para el modal de cancelación
import { QRCodeSVG } from 'qrcode.react'; // Importamos el generador de QR

// --- Interfaces ---
interface MembershipPlan {
  name: string;
}

interface UserMembership {
  _id: string;
  membership: MembershipPlan;
  endDate: string;
  classesRemaining: number;
  status: string;
}

interface Booking {
  _id: string;
  bookingDate: string;
  schedule: {
    startTime: string;
    endTime: string;
    location: { name: string };
  };
}

export default function ClientDashboardPage() {
  const { user, logout, token } = useAuth();
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Estados para el modal de cancelación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Carga de Datos ---
  const fetchData = async () => {
    if (!token) return;
    try {
      // Hacemos ambas peticiones en paralelo
      const [membershipsRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:5000/user-memberships/my-memberships', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/bookings/my-bookings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setMemberships(membershipsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error al cargar los datos del dashboard:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // --- Lógica de Cancelación ---
  const handleCancelClick = (bookingId: string) => {
    setCancelingBookingId(bookingId);
    setIsModalOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (!cancelingBookingId || !token) return;
    setIsLoading(true);
    try {
      await axios.delete(
        `http://localhost:5000/bookings/${cancelingBookingId}/cancel`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Reserva cancelada con éxito. Se ha devuelto 1 clase a tu membresía.');
      fetchData(); // Recargamos todos los datos
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      alert(`Error al cancelar: ${err.response?.data?.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setCancelingBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar del Dashboard */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-orange-500">Gym App</Link>
        <div>
          <span className="mr-4">Hola, {user?.name}</span>
          <button onClick={logout} className="text-red-500 hover:underline">Cerrar Sesión</button>
        </div>
      </nav>

      {/* Contenido del Dashboard */}
      <div className="p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Mi Panel de Control
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Principal: Reservas y Acciones */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sección: Mis Próximas Clases */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Próximas Clases</h2>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking._id} className="border p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{booking.schedule.location.name}</p>
                        <p>{new Date(booking.bookingDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        <p className="text-gray-600">{booking.schedule.startTime} - {booking.schedule.endTime}</p>
                      </div>
                      <button 
                        onClick={() => handleCancelClick(booking._id)}
                        className="text-red-500 hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tienes clases reservadas. ¡Anímate a reservar una!</p>
              )}
              <Link to="/schedules" className="mt-6 inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md">
                Reservar una Clase Nueva
              </Link>
            </div>

            {/* --- SECCIÓN NUEVA DEL CÓDIGO QR --- */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Mi Pase de Acceso</h2>
              {user ? (
                <div className="flex flex-col items-center">
                  <QRCodeSVG 
                    value={user.id} // El QR contiene el ID del usuario
                    size={256} // Tamaño del QR
                    className="mb-4"
                  />
                  <p className="text-gray-600">Muestra este código al staff para registrar tu entrada o salida.</p>
                </div>
              ) : (
                <p>Cargando tu pase...</p>
              )}
            </div>
          </div>

          {/* Columna Lateral: Mis Membresías */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Membresías</h2>
              {memberships.filter(m => m.status === 'ACTIVE').length > 0 ? (
                <div className="space-y-4">
                  {memberships.filter(m => m.status === 'ACTIVE').map(mem => (
                    <div key={mem._id} className="bg-gradient-to-r from-orange-400 to-yellow-300 p-4 rounded-lg text-white shadow-lg">
                      <p className="font-bold text-xl">{mem.membership.name}</p>
                      <p className="text-3xl font-extrabold my-2">{mem.classesRemaining}</p>
                      <p className="text-sm">clases restantes</p>
                      <p className="text-xs mt-2">Vence el: {new Date(mem.endDate).toLocaleDateString('es-ES')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tienes membresías activas.</p>
              )}
              <Link to="/memberships" className="mt-6 inline-block text-orange-600 font-semibold hover:underline">
                Comprar un nuevo plan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Cancelación */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirmar Cancelación">
        <div>
          <p className="mb-6">¿Estás seguro de que quieres cancelar esta reserva? Se te devolverá 1 clase a tu membresía.</p>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">No</button>
            <button type="button" onClick={confirmCancelBooking} disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-red-300">
              {isLoading ? 'Cancelando...' : 'Sí, Cancelar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}