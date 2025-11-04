import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { QRCodeSVG } from 'qrcode.react';

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

interface Location {
  _id: string;
  name: string;
  address: string;
  geo: {
    coordinates: [number, number]; // [lng, lat]
  };
}

// --- Función de Distancia (Haversine) ---
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distancia en km
}

export default function ClientDashboardPage() {
  const { user, logout, token } = useAuth();
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Estados para el modal de cancelación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Para el modal de cancelación

  // Estados para la geolocalización
  const [nearestLocation, setNearestLocation] = useState<Location | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // --- Carga de Datos (Reservas y Membresías) ---
  const fetchData = async () => {
    if (!token) return;
    try {
      // Usamos 'setIsLoading' general para la carga inicial
      setIsLoading(true); 
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // --- Geolocalización (Sucursales) ---
  useEffect(() => {
    const findNearestLocation = (userLat: number, userLng: number, allLocations: Location[]) => {
      let closest: Location | null = null;
      let minDistance = Infinity;
      for (const loc of allLocations) {
        const [locLng, locLat] = loc.geo.coordinates;
        const dist = getDistance(userLat, userLng, locLat, locLng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = loc;
        }
      }
      setNearestLocation(closest);
      setDistance(minDistance);
    };

    const fetchLocationsAndRecommend = async (position: GeolocationPosition) => {
      try {
        const response = await axios.get('http://localhost:5000/locations');
        const allLocations: Location[] = response.data;
        if (allLocations.length > 0) {
          findNearestLocation(position.coords.latitude, position.coords.longitude, allLocations);
        }
      } catch (err) { console.error("Error al cargar sucursales:", err); }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        fetchLocationsAndRecommend,
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationError("Habilita tu ubicación para ver tu sucursal más cercana.");
          } else {
            setLocationError("No se pudo obtener tu ubicación.");
          }
        }
      );
    } else {
      setLocationError("La geolocalización no es soportada por este navegador.");
    }
  }, []);

  // --- LÓGICA DE CANCELACIÓN (RESTAURADA) ---
  const handleCancelClick = (bookingId: string) => {
    setCancelingBookingId(bookingId); // <-- ¡CORREGIDO!
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
  // --- FIN DE LA LÓGICA RESTAURADA ---

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-orange-500">Gym App</Link>
        <div>
          <span className="mr-4">Hola, {user?.firstName}</span>
          <Link to="/profile" className="mr-4 text-gray-600 hover:text-orange-500">Mi Perfil</Link>
          <button onClick={logout} className="text-red-500 hover:underline">Cerrar Sesión</button>
        </div>
      </nav>

      {/* Contenido del Dashboard */}
      <div className="p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Mi Panel de Control
        </h1>

        {/* Widget de Recomendación */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📍 Sucursal Más Cercana</h2>
          {locationError && (
            <p className="text-sm text-yellow-600">{locationError}</p>
          )}
          {nearestLocation && distance !== null ? (
            <div>
              <p className="text-lg">Tu sucursal recomendada es:</p>
              <h3 className="text-3xl font-bold text-orange-600">{nearestLocation.name}</h3>
              <p className="text-gray-600">{nearestLocation.address}</p>
              <p className="font-semibold mt-2">Estás a ~{distance.toFixed(1)} km de distancia.</p>
            </div>
          ) : (
            !locationError && <p>Calculando tu sucursal más cercana...</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Principal: Reservas y QR */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Próximas Clases</h2>
              {isLoading ? (
                 <p>Cargando clases...</p>
              ) : bookings.length > 0 ? (
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
              {/* TODO: Cambiar este enlace a la página de reservar */}
              <Link to="/schedules" className="mt-6 inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md">
                Reservar una Clase Nueva
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Mi Pase de Acceso</h2>
              {user ? (
                <div className="flex flex-col items-center">
                  <QRCodeSVG 
                    value={user.id}
                    size={256}
                    className="mb-4"
                  />
                  <p className="text-gray-600">Muestra este código al staff para registrar tu entrada o salida.</p>
                </div>
              ) : (
                <p>Cargando tu pase...</p>
              )}
            </div>
          </div>

          {/* Columna Lateral: Puntos y Membresías */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Mis Puntos</h2>
              <p className="text-6xl font-extrabold text-orange-500">{user?.points || 0}</p>
              <p className="text-gray-500 mt-2">¡Gana más puntos al comprar y asistir!</p>
              {/* TODO: Añadir enlace a la tienda de puntos */}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Membresías</h2>
              {isLoading ? (
                <p>Cargando membresías...</p>
              ) : memberships.filter(m => m.status === 'ACTIVE').length > 0 ? (
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
              <Link to="/dashboard/memberships" className="mt-6 inline-block text-orange-600 font-semibold hover:underline">
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