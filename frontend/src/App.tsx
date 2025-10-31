// import { Outlet } from 'react-router-dom';
// import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// // Obtenemos el Client ID desde las variables de entorno
// const initialOptions = {
//   clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
//   currency: "MXN", // O la moneda que configuraste, ej. "MXN"
//   intent: "capture",
// };

// function App() {
//   return (
//     // Envolvemos toda la aplicación con el proveedor de PayPal
//     <PayPalScriptProvider options={initialOptions}>
//       <div className="App">
//         <Outlet />
//       </div>
//     </PayPalScriptProvider>
//   );
// }

// export default App;

import { Outlet } from 'react-router-dom';

function App() {
  // Este componente ahora es más simple
  return (
    <div className="App">
      <Outlet />
    </div>
  );
}

export default App;