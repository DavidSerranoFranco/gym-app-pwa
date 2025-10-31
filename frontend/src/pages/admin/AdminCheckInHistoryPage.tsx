import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Interfaces para los datos que esperamos
interface CheckInHistory {
  _id: string;
  user: { name: string; email: string };
  location: { name: string };
  booking: {
    schedule: { startTime: string; endTime: string };
  };
  checkInTime: string;
  checkOutTime: string | null; // Correcto: puede ser null
  status: 'CHECKED_IN' | 'CHECKED_OUT';
}

export default function AdminCheckInHistoryPage() {
  const [history, setHistory] = useState<CheckInHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchHistory = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/check-ins/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data);
    } catch (error) {
      console.error('Error al obtener el historial de check-ins:', error);
      alert('No se pudo cargar el historial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  // --- AQUÍ ESTÁ LA CORRECCIÓN ---
  // Se cambia la firma para aceptar string | null
  const formatDateTime = (dateString: string | null) => {
    // Esta lógica ya maneja el caso 'null' o un string vacío
    if (!dateString) return '---';
    
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Historial de Entradas y Salidas</h1>
      </div>

      {loading ? (
        <p>Cargando historial...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Usuario</th>
                <th className="py-3 px-4 text-left">Sucursal</th>
                <th className="py-3 px-4 text-left">Horario de Clase</th>
                <th className="py-3 px-4 text-left">Hora de Entrada</th>
                <th className="py-3 px-4 text-left">Hora de Salida</th>
                <th className="py-3 px-4 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold">{record.user?.name || 'Usuario Eliminado'}</div>
                    <div className="text-sm text-gray-500">{record.user?.email || ''}</div>
                  </td>
                  <td className="py-3 px-4">{record.location?.name || 'Sucursal Eliminada'}</td>
                  <td className="py-3 px-4">
                    {record.booking?.schedule?.startTime || '??'} - {record.booking?.schedule?.endTime || '??'}
                  </td>
                  <td className="py-3 px-4">{formatDateTime(record.checkInTime)}</td>
                  {/* Esta línea ya no dará error */}
                  <td className="py-3 px-4">{formatDateTime(record.checkOutTime)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      record.status === 'CHECKED_IN'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status === 'CHECKED_IN' ? 'Adentro' : 'Afuera'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}