import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

// --- 1. INTERFAZ CORREGIDA ---
// El backend ahora envía 'firstName' y 'paternalLastName'
interface User {
  _id: string;
  firstName: string; // 'name' se ha renombrado
  paternalLastName: string; // Se añade el apellido
  email: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // El endpoint /auth/users devuelve la lista de usuarios
        const response = await axios.get('http://localhost:5000/auth/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error al obtener la lista de usuarios:', error);
        alert('No se pudo cargar la lista de usuarios.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Usuarios (Clientes)</h1>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Nombre</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  
                  {/* --- 2. CÓDIGO CORREGIDO --- */}
                  {/* Se muestra el nombre y el primer apellido */}
                  <td className="py-3 px-4 font-semibold">
                    {user.firstName} {user.paternalLastName}
                  </td>
                  
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/admin/users/${user._id}`} // Enlace al perfil detallado
                      className="text-orange-600 hover:text-orange-800 font-semibold"
                    >
                      Ver Perfil Completo
                    </Link>
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