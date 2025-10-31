// frontend/src/router/AppRouter.tsx

import { createBrowserRouter } from 'react-router-dom';

// Vistas Públicas
import App from '../App';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PublicMembershipsPage from '../pages/PublicMembershipsPage';
import PublicSchedulesPage from '../pages/PublicSchedulesPage';
import RootLayout from './RootLayout';

// Vistas de Cliente
import ClientDashboardPage from '../pages/ClientDashboardPage';
import ClientProfilePage from '../pages/ClientProfilePage';

// Vistas de Administrador
import AdminLayout from '../pages/admin/AdminLayout';
import AdminMembershipsPage from '../pages/admin/AdminMembershipsPage';
import AdminSchedulesPage from '../pages/admin/AdminSchedulesPage';
import AdminLocationsPage from '../pages/admin/AdminLocationsPage';
import AdminUserMembershipsPage from '../pages/admin/AdminUserMembershipsPage';
import AdminScannerPage from '../pages/admin/AdminScannerPage';
import AdminCheckInHistoryPage from '../pages/admin/AdminCheckInHistoryPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminUserProfilePage from '../pages/admin/AdminUserProfilePage';

export const router = createBrowserRouter([
  {
    // El RootLayout es ahora el elemento padre de TODA la aplicación.
    element: <RootLayout />,
    children: [
      // Grupo de rutas públicas que comparten un layout base (App.tsx)
      {
        element: <App />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'memberships', element: <PublicMembershipsPage /> },
          { path: 'schedules', element: <PublicSchedulesPage /> },
        ]
      },
      // Rutas que usan su propio layout
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'dashboard', element: <ClientDashboardPage /> },
      { path: 'profile', element: <ClientProfilePage /> },
      // Grupo de rutas de administrador
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { path: 'memberships', element: <AdminMembershipsPage /> },
          { path: 'schedules', element: <AdminSchedulesPage /> },
          { path: 'locations', element: <AdminLocationsPage /> },
          { path: 'user-memberships', element: <AdminUserMembershipsPage /> },
          { path: 'scanner', element: <AdminScannerPage /> },
          { path: 'check-ins', element: <AdminCheckInHistoryPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'users/:id', element: <AdminUserProfilePage /> },
        ],
      },
    ],
  },
]);