import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { router } from './router/AppRouter.tsx';
import './index.css';
 
const initialOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Dejamos solo el PayPalScriptProvider aquí */}
    <PayPalScriptProvider options={initialOptions}>
      <RouterProvider router={router} />
    </PayPalScriptProvider>
  </React.StrictMode>,
);