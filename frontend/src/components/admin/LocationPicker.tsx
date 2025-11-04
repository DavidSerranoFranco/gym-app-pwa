import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios'; // <-- 1. Importar axios

// Arreglar el icono que se rompe por defecto en Leaflet con React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Position {
  lat: number;
  lng: number;
}

// 2. Interfaz de props actualizada
interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number) => void;
  onAddressFound: (address: string) => void; // <-- 3. Nueva prop para la dirección
  initialPosition?: Position;
}

// Componente interno para manejar los clics en el mapa
function MapClickHandler({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng); // Llama a la función del padre
    },
  });
  return null;
}

export default function LocationPicker({ 
  onLocationChange, 
  onAddressFound, // <-- 4. Usar la nueva prop
  initialPosition 
}: LocationPickerProps) {
  
  const defaultCenter: Position = initialPosition || { lat: 20.67, lng: -103.35 };
  
  const [markerPos, setMarkerPos] = useState<Position>(defaultCenter);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  // 5. Sincronizar el marcador si la posición inicial cambia (al editar)
  useEffect(() => {
    setMarkerPos(initialPosition || defaultCenter);
  }, [initialPosition]);

  // 6. Función "mágica" de Geocodificación Inversa
  const handleMapClick = async (latlng: L.LatLng) => {
    const { lat, lng } = latlng;
    
    // Mover el marcador y actualizar lat/lng inmediatamente
    setMarkerPos(latlng);
    onLocationChange(lat, lng);
    setIsFetchingAddress(true);

    try {
      // 7. Llamada a la API de Nominatim (gratuita)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      
      const address = response.data.display_name;
      if (address) {
        onAddressFound(address); // <-- 8. Enviar la dirección al formulario
      }
    } catch (err) {
      console.error("Error al obtener la dirección (Geocodificación Inversa):", err);
    } finally {
      setIsFetchingAddress(false);
    }
  };

  return (
    <div className="h-64 w-full rounded-md overflow-hidden border relative">
      <MapContainer center={markerPos} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={markerPos}></Marker>
        <MapClickHandler onMapClick={handleMapClick} />
      </MapContainer>
      
      {/* 9. Feedback visual para el usuario */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-white bg-opacity-75 text-center text-xs text-gray-700">
        {isFetchingAddress ? 'Buscando dirección...' : 'Haz clic en el mapa para seleccionar la ubicación'}
      </div>
    </div>
  );
}