import { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Link } from 'react-router-dom';

interface Location {
  _id: string;
  name: string;
}

interface CheckInResponse {
  message: string;
  user: {
    firstName: string;
    paternalLastName: string;
  };
  userMembership: {
    classesRemaining: number;
    status: string;
  };
}

export default function AdminScannerPage() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  // 1. Usar useRef para guardar el estado y evitar "stale closures"
  const scannerStateRef = useRef({
    isLoading,
    selectedLocationId,
    token
  });

  // 2. Actualizar la referencia cada vez que el estado cambie
  useEffect(() => {
    scannerStateRef.current = {
      isLoading,
      selectedLocationId,
      token
    };
  }, [isLoading, selectedLocationId, token]);

  // 3. Cargar las sucursales (solo una vez)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/locations');
        setLocations(response.data);
        if (response.data.length > 0) {
          setSelectedLocationId(response.data[0]._id);
        }
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
        setError("No se pudieron cargar las sucursales.");
      }
    };
    fetchLocations();
  }, []); // Array vacío = ejecutar 1 vez

  // 4. Inicializar el escáner (solo una vez)
  useEffect(() => {
    const scannerRegionId = "qr-scanner-region";
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerRegionId,
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      false // verbose = false
    );

    // 5. La función de éxito AHORA USA LA REFERENCIA
    const onScanSuccess = async (decodedText: string) => {
      // Leer el estado "en vivo" desde la referencia
      const { isLoading, selectedLocationId, token } = scannerStateRef.current;

      if (isLoading) return;
      
      // Actualizar el estado real (para la UI)
      setIsLoading(true);
      setScanResult(null);
      setError(null);

      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      
      // 6. Validar que 'decodedText' sea un string válido
      if (typeof decodedText !== 'string' || !mongoIdRegex.test(decodedText)) {
        setError(`Código QR inválido. (Recibido: ${decodedText})`);
        setTimeout(() => {
          setIsLoading(false);
          setError(null);
        }, 3000);
        return;
      }

      if (!selectedLocationId) {
        setError("Por favor, selecciona una sucursal.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post<CheckInResponse>(
          'http://localhost:5000/check-ins/scan',
          { 
            userId: decodedText,
            locationId: selectedLocationId 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const { user, userMembership } = response.data;
        setScanResult(`Acceso: ${user.firstName} ${user.paternalLastName}. Clases restantes: ${userMembership.classesRemaining}`);
        
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || 'Error desconocido';
        setError(`Error: ${message}`);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
          setScanResult(null);
          setError(null);
        }, 3000);
      }
    };

    html5QrcodeScanner.render(onScanSuccess, () => {
      // Ignorar errores de "no se encontró QR"
    });

    // Limpieza al desmontar el componente
    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Fallo al limpiar el escáner de QR.", error);
      });
    };
  }, []); // Array vacío = ejecutar 1 vez

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Escanear QR</h1>
      
      <div className="mb-4">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Registrando Check-in en:</label>
        <select
          id="location"
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          disabled={isLoading || locations.length === 0}
        >
          {locations.length === 0 ? (
             <option>Cargando sucursales...</option>
          ) : (
             locations.map(loc => (
              <option key={loc._id} value={loc._id}>{loc.name}</option>
            ))
          )}
        </select>
      </div>

      <div id="qr-scanner-region" className="w-full"></div>

      <div className="text-center mt-4 h-16">
        {isLoading && (
          <p className="text-lg font-semibold text-blue-600">Procesando...</p>
        )}
        {scanResult && (
          <div className="p-3 bg-green-100 text-green-800 rounded-md">
            <p className="font-bold text-lg">{scanResult}</p>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded-md">
            <p className="font-bold text-lg">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link to="/admin/check-ins" className="text-sm text-orange-600 hover:underline">
          Ver historial de Check-ins
        </Link>
      </div>
    </div>
  );
}