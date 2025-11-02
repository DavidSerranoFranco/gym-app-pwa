import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useNavigate } from 'react-router-dom';

// Interfaz ACTUALIZADA
interface Membership {
  _id: string;
  name: string;
  price: number;
  durationDays: number;
  classesPerWeek: number;
  description: string;
  points: number;
}

export default function ClientMembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [selectedMembershipId, setSelectedMembershipId] = useState<string | null>(null);
  const payPalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axios.get('http://localhost:5000/memberships');
        setMemberships(response.data);
      } catch (err) {
        setError('No se pudieron cargar las membresías.');
      } finally {
        setLoading(false);
      }
    };
    fetchMemberships();
  }, []);

  const handlePaymentStart = (membershipId: string) => {
    if (!token) {
      alert("Por favor, inicia sesión para comprar una membresía.");
      navigate('/login');
      return;
    }
    setSelectedMembershipId(membershipId);
  };

  // createOrder (Corregido)
  const createOrder = async () => {
    if (!selectedMembershipId || !token) {
      alert("Error: No se ha seleccionado una membresía o no has iniciado sesión.");
      return '';
    }
    try {
      const response = await axios.post(
        'http://localhost:5000/payments/create-order',
        { membershipId: selectedMembershipId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.orderID;
    } catch (error) {
      console.error('Error al crear la orden de PayPal:', error);
      alert('No se pudo iniciar el proceso de pago. Intenta de nuevo.');
      return '';
    }
  };

  // onApprove (Corregido)
  const onApprove = async (data: { orderID: string }) => {
    if (!selectedMembershipId || !token) {
      console.error("Error crítico: Faltan datos para la aprobación.");
      return;
    }
    try {
      await axios.post(
        'http://localhost:5000/payments/capture-order',
        { 
          orderID: data.orderID,
          membershipId: selectedMembershipId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('¡Pago completado! Tu membresía está activa.');
      navigate('/dashboard/my-memberships'); 
    } catch (error) {
      console.error('Error al capturar el pago:', error);
      alert('Hubo un error al procesar tu pago. Contacta a soporte.');
    } finally {
      setSelectedMembershipId(null);
    }
  };
  
  const onCancel = () => {
    alert("Pago cancelado.");
    setSelectedMembershipId(null);
  };
  
  const onError = (err: any) => {
     console.error("Error de PayPal:", err);
     alert("Ocurrió un error inesperado con PayPal. Intenta de nuevo.");
     setSelectedMembershipId(null);
  };

  if (loading) return <p>Cargando membresías...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (!payPalClientId) {
    return <p className="text-red-500 font-bold text-center p-8">Error: VITE_PAYPAL_CLIENT_ID no está configurado.</p>;
  }

  return (
    // --- AQUÍ ESTÁ LA CORRECCIÓN DE TYPESCRIPT ---
    // 'client-id' (string) se cambia por 'clientID' (propiedad)
    <PayPalScriptProvider options={{ clientId: payPalClientId, currency: 'MXN', intent: 'capture' }}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Nuestras Membresías</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memberships.map((mem) => (
            <div key={mem._id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800">{mem.name}</h2>
              <p className="text-4xl font-extrabold text-orange-600 my-4">
                ${mem.price.toFixed(2)} <span className="text-lg font-normal text-gray-500">/ {mem.durationDays} días</span>
              </p>
              <p className="text-gray-600">{mem.description || 'Descripción no disponible.'}</p>
              <ul className="my-4 space-y-2">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Acceso a {mem.classesPerWeek} clases por semana</span>
                </li>
                 <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Gana {mem.points} puntos con esta compra</span>
                </li>
              </ul>
              <div className="mt-auto">
                {selectedMembershipId === mem._id ? (
                  <PayPalButtons
                    key={mem._id}
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                    onCancel={onCancel}
                  />
                ) : (
                  <button
                    onClick={() => handlePaymentStart(mem._id)}
                    className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600"
                  >
                    Pagar con PayPal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}