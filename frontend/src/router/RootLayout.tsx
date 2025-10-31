import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    // Este proveedor ahora envuelve a TODAS las rutas posibles
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}