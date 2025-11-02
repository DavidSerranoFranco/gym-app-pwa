import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"; // Importar Provider
import { useAuth } from '../context/AuthContext';

// 1. Interfaz ACTUALIZADA
interface Membership {
  _id: string;
  name: string;
  price: number;
  durationDays: number; // Corregido
  classesPerWeek: number; // Corregido
  points: number; // Añadido
  description: string;
  // 'isActive' ya no se usa aquí, el backend debe filtrar
}

// 2. ID de Cliente de PayPal (asegúrate que esté en tu .env)
const payPalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export default function PublicMembershipsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  
  // 3. Estado para manejar la selección (NECESARIO)
  const [selectedMembershipId, setSelectedMembershipId] = useState<string | null>(null);
  
  const isLoggedIn = !!user;

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axios.get('http://localhost:5000/memberships');
        setMemberships(response.data); 
      } catch (error) {
        console.error('Error al obtener las membresías:', error);
      }
    };
    fetchMemberships();
  }, []);

  // 4. CREATE ORDER (Corregido)
  const createOrder = async () => {
    if (!selectedMembershipId || !token) {
      alert("Error: No se ha seleccionado una membresía o no has iniciado sesión.");
      return '';
    }
    try {
      const response = await axios.post(
        'http://localhost:5000/payments/create-order',
        { membershipId: selectedMembershipId }, // Enviar ID de membresía
        { headers: { Authorization: `Bearer ${token}` } } // Enviar Token
      );
      return response.data.orderID;
    } catch (error) {
      console.error("Error al crear la orden de PayPal:", error);
      alert("No se pudo iniciar el proceso de pago. Intenta de nuevo.");
      return '';
    }
  };

  // 5. ON APPROVE (Corregido)
  const onApprove = async (data: { orderID: string }) => {
    if (!selectedMembershipId || !token) {
      alert("Error crítico. Faltan datos para la aprobación.");
      return;
    }
    try {
      await axios.post(
        'http://localhost:5000/payments/capture-order', 
        { 
          orderID: data.orderID,
          membershipId: selectedMembershipId // Enviar ID de membresía
        },
        { headers: { Authorization: `Bearer ${token}` } } // Enviar Token
      );
      
      alert('¡Pago completado! Tu membresía ha sido activada.');
      navigate('/dashboard');
    } catch (error) {
       console.error("Error al capturar el pago:", error);
       alert("Hubo un error al procesar tu pago. Contacta a soporte.");
    } finally {
      setSelectedMembershipId(null);
    }
  };

  if (!payPalClientId) {
    return <p className="text-red-500 font-bold text-center p-8">Error: VITE_PAYPAL_CLIENT_ID no está configurado.</p>;
  }

  return (
    // 6. Envolver en el Provider (con 'clientID' corregido)
    <PayPalScriptProvider options={{ clientId: payPalClientId, currency: 'MXN', intent: 'capture' }}>
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">Nuestros Planes</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memberships.map((membership) => (
              <div key={membership._id} className="bg-white rounded-xl shadow-lg p-8 flex flex-col transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-2xl font-bold text-gray-800">{membership.name}</h2>
                <div className="my-4">
                  <span className="text-5xl font-extrabold text-gray-900">${membership.price.toFixed(2)}</span>
                  {/* 7. Usar campos corregidos */}
                  <span className="text-lg text-gray-500">/ {membership.durationDays} días</span>
                </div>
                <p className="text-gray-600 mb-6 flex-grow">
                  Acceso a {membership.classesPerWeek} clases por semana.
                </p>

                <div className="mt-auto">
                  {isLoggedIn ? (
                    // 8. Lógica de botones
                    selectedMembershipId === membership._id ? (
                      <PayPalButtons
                        key={membership._id} // Añadir key para forzar re-render
                        style={{ layout: "vertical", label: "pay" }}
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onCancel={() => setSelectedMembershipId(null)}
                        onError={(err) => {
                          console.error("Error de PayPal:", err);
                          alert("Ocurrió un error inesperado con PayPal.");
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => setSelectedMembershipId(membership._id)}
                        className="block w-full text-center bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
                      >
                        Comprar
                      </button>
                    )
                  ) : (
                    <Link
                      to="/login"
                      className="block w-full text-center bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
                    >
                      Inicia Sesión para Comprar
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}