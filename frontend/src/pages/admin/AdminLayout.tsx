// frontend/src/pages/admin/AdminLayout.tsx

import { Outlet, NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { logout } = useAuth();
  const activeLinkStyle = {
    backgroundColor: '#F97316', // Naranja
    color: 'white',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Barra Lateral de Navegación */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold text-orange-500 mb-6">Admin Panel</h2>
        <nav className="flex flex-col space-y-2">
          <NavLink
            to="/admin/memberships"
            className="px-4 py-2 rounded-md text-gray-700 hover:bg-orange-100"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
          >
            Membresías
          </NavLink>
          <NavLink
            to="/admin/schedules" // Ruta para el futuro
            className="px-4 py-2 rounded-md text-gray-700 hover:bg-orange-100"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
          >
            Horarios y Cupos
          </NavLink>
          <NavLink
          to="/admin/locations"
          className="px-4 py-2 rounded-md text-gray-700 hover:bg-orange-100"
          style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
          >
            Sucursales
          </NavLink>
          <NavLink to="/admin/locations" /* ... */ >Sucursales</NavLink>
          {/* AÑADE ESTE ENLACE */}
          <NavLink
              to="/admin/user-memberships"
              className="px-4 py-2 rounded-md text-gray-700 hover:bg-orange-100"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
          >
              Suscripciones
          </NavLink>
        </nav>
        <div className="mt-auto">
          <Link to="/" className="block text-sm text-gray-600 hover:text-orange-500 mb-4">Volver al Inicio</Link>
          <button onClick={logout} className="w-full text-left px-4 py-2 rounded-md text-sm text-red-500 hover:bg-red-100">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal de la Página */}
      <main className="flex-1 p-8">
        <Outlet /> {/* Aquí se renderizarán las páginas de admin */}
      </main>
    </div>
  );
}