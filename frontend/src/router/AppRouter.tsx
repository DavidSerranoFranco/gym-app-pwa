// frontend/src/router/AppRouter.tsx

import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import LandingPage from '../pages/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ]
  },
]);