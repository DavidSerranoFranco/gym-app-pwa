import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from '../context/AuthContext'; // Importamos nuestro hook de autenticación

interface Membership {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  classCount: number;
  isActive: boolean;
}

export default function PublicMembershipsPage() {
  // 1. Obtenemos el usuario Y el token directamente del contexto.
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [memberships, setMemberships] = useState<Membership[]>([]);

  // 2. El estado de "logueado" se deriva directamente de si existe un usuario en el contexto.
  //    Ya no necesitamos un estado local 'isLoggedIn'.
  const isLoggedIn = !!user;

  useEffect(() => {
    // 3. El useEffect ahora solo se preocupa de cargar las membresías.
    //    Ya no necesita revisar localStorage, el AuthProvider ya hizo ese trabajo.
    const fetchMemberships = async () => {
      try {
        const response = await axios.get('http://localhost:5000/memberships');
        setMemberships(response.data.filter((m: Membership) => m.isActive));
      } catch (error) {
        console.error('Error al obtener las membresías:', error);
      }
    };

    fetchMemberships();
  }, []); // Se ejecuta solo una vez al cargar la página.

  // La función 'createOrder' no necesita cambios
  const createOrder = async (membershipId: string) => {
    try {
      const response = await axios.post('http://localhost:5000/payments/create-order', { membershipId });
      return response.data.orderID;
    } catch (error) {
      console.error("Error al crear la orden de PayPal:", error);
      alert("No se pudo iniciar el proceso de pago. Intenta de nuevo.");
      return '';
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      // 4. Usamos el token del contexto en lugar de leerlo de localStorage.
      if (!token) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        navigate('/login');
        return;
      }

      await axios.post('http://localhost:5000/payments/capture-order', 
        { orderID: data.orderID },
        { headers: { Authorization: `Bearer ${token}` } } // Enviamos el token del contexto
      );
      
      alert('¡Pago completado! Tu membresía ha sido activada.');
      navigate('/dashboard');
    } catch (error) {
       console.error("Error al capturar el pago:", error);
       alert("Hubo un error al procesar tu pago. Contacta a soporte.");
    }
  };

  // El JSX no necesita cambios, ya que la variable 'isLoggedIn' sigue funcionando igual
  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* ... (código JSX sin cambios) ... */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">Nuestros Planes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memberships.map((membership) => (
            <div key={membership._id} className="bg-white rounded-xl shadow-lg p-8 flex flex-col transform hover:scale-105 transition-transform duration-300">
              <h2 className="text-2xl font-bold text-gray-800">{membership.name}</h2>
              <div className="my-4">
                <span className="text-5xl font-extrabold text-gray-900">${membership.price}</span>
                <span className="text-lg text-gray-500">/ {membership.durationInDays} días</span>
              </div>
              <p className="text-gray-600 mb-6 flex-grow">
                Acceso a {membership.classCount} clases durante {membership.durationInDays} días.
              </p>

              <div className="mt-auto">
                {isLoggedIn ? (
                  <PayPalButtons
                    style={{ layout: "vertical", label: "pay" }}
                    createOrder={() => createOrder(membership._id)}
                    onApprove={onApprove}
                  />
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
  );
}