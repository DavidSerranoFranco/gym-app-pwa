import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function AdminScannerPage() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScanSuccess = async (decodedText: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setScanResult(decodedText);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/check-ins/scan',
        { userId: decodedText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      alert(`Éxito: ${response.data.message}`);
      
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message || 'Error desconocido';
      alert(`Error: ${message}`);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setScanResult(null);
      }, 3000);
    }
  };

  useEffect(() => {
    const scannerRegionId = "qr-scanner-region"; 
    
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerRegionId,
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      false
    );

    // --- AQUÍ ESTÁ LA CORRECCIÓN ---
    // Renombramos 'errorMessage' a '_errorMessage'
    html5QrcodeScanner.render(handleScanSuccess, (_errorMessage) => {
      // Esta función se llama si hay un error (ej. no encuentra QR)
      // La dejamos vacía (ahora con _errorMessage) para que no sea molesta.
    });

    // Función de limpieza al salir de la página
    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Fallo al limpiar el escáner de QR.", error);
      });
    };
  }, [isLoading, token]); // Volvemos a crear el escáner si el token o el estado de carga cambian

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Escáner de Acceso (Check-in / Check-out)</h1>
      
      <div id="qr-scanner-region" className="w-full max-w-md mx-auto"></div>

      <div className="text-center mt-4">
        {isLoading && (
          <p className="text-lg font-semibold text-orange-600">Procesando...</p>
        )}
        {scanResult && !isLoading && (
          <p className="text-lg font-semibold text-green-600">Escaneo completado. Listo para el siguiente.</p>
        )}
      </div>
    </div>
  );
}