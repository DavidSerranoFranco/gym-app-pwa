import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Interfaz para la membresía del usuario
interface UserMembership {
  _id: string;
  membership: {
    name: string;
    durationDays: number;
    classesPerWeek: number;
  };
  startDate: string;
  endDate: string;
  classesRemaining: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export default function ClientMyMembershipsPage() {
  const [myMemberships, setMyMemberships] = useState<UserMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMyMemberships = async () => {
      if (!token) return;
      try {
        // 1. Llamar al nuevo endpoint del backend
        const response = await axios.get('http://localhost:5000/user-memberships/my-memberships', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyMemberships(response.data);
      } catch (err) {
        console.error("Error al cargar mis membresías:", err);
        setError("No se pudieron cargar tus membresías.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyMemberships();
  }, [token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-orange-600 hover:underline mb-4 inline-block">
          &larr; Volver al Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Mis Membresías</h1>

        {loading && <p>Cargando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="space-y-6">
            {myMemberships.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-700">Aún no tienes membresías activas.</p>
                <Link 
                  to="/dashboard/memberships" // 2. Enlace a la página de compra
                  className="mt-4 inline-block bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600"
                >
                  Ver planes
                </Link>
              </div>
            ) : (
              myMemberships.map((mem) => (
                <div key={mem._id} className={`p-6 rounded-lg shadow-md ${mem.status === 'ACTIVE' ? 'bg-white' : 'bg-gray-200 opacity-75'}`}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">{mem.membership.name}</h2>
                    <span 
                      className={`font-bold px-3 py-1 rounded-full text-sm ${
                        mem.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {mem.status === 'ACTIVE' ? 'Activa' : 'Expirada/Cancelada'}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Clases Restantes</h3>
                      <p className="text-xl font-bold text-orange-600">{mem.classesRemaining}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Válida hasta</h3>
                      <p className="text-lg text-gray-800">{formatDate(mem.endDate)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}