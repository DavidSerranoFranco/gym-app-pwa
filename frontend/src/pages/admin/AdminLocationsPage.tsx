import { useState, useEffect, type FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import LocationPicker from '../../components/admin/LocationPicker'; // Importar el mapa

interface Location {
  _id: string;
  name: string;
  address: string;
  geo: {
    coordinates: [number, number]; // [lng, lat]
  };
}

const initialFormData = {
  name: '',
  address: '',
  latitude: 20.67, // GDL
  longitude: -103.35,
};

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error al obtener las sucursales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // --- Handlers para Modales ---

  const openCreateModal = () => {
    setSelectedLocation(null);
    setFormData(initialFormData);
    setIsFormModalOpen(true);
  };

  const openEditModal = (location: Location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      latitude: location.geo.coordinates[1],
      longitude: location.geo.coordinates[0],
    });
    setIsFormModalOpen(true);
  };
  
  const openDeleteModal = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedLocation(null);
  };

  // --- Handlers de Formulario ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  // --- 1. NUEVA FUNCIÓN ---
  // Se activa cuando el LocationPicker encuentra una dirección
  const handleAddressFound = (address: string) => {
    setFormData(prev => ({ ...prev, address: address }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (selectedLocation) {
        await axios.patch(`http://localhost:5000/locations/${selectedLocation._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:5000/locations', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchLocations();
      closeModals();
    } catch (err) {
      const error = err as AxiosError<{ message: string | string[] }>;
      const msg = error.response?.data?.message || 'Error al guardar la sucursal';
      alert(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLocation || !token) return;
    try {
      await axios.delete(`http://localhost:5000/locations/${selectedLocation._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Sucursal eliminada con éxito');
      fetchLocations();
    } catch (error) {
      console.error('Error al eliminar la sucursal:', error);
    } finally {
      closeModals();
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestionar Sucursales</h1>
        <button onClick={openCreateModal} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md">
          + Agregar Sucursal
        </button>
      </div>

      <table className="min-w-full bg-white">
        {/* ... (código de la tabla sin cambios) ... */}
         <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">Nombre</th>
            <th className="py-3 px-4 text-left">Dirección</th>
            <th className="py-3 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location._id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{location.name}</td>
              <td className="py-3 px-4">{location.address}</td>
              <td className="py-3 px-4">
                <button onClick={() => openEditModal(location)} className="text-yellow-500 hover:text-yellow-700 mr-4">Editar</button>
                <button onClick={() => openDeleteModal(location)} className="text-red-500 hover:text-red-700">Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de Crear/Editar */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={closeModals} 
        title={selectedLocation ? 'Editar Sucursal' : 'Nueva Sucursal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la Sucursal"
            type="text"
            name="name"
            placeholder="Ej. Sucursal Centro"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Dirección (Se autocompleta con el mapa)"
            type="text"
            name="address"
            placeholder="Ej. Av. Siempre Viva 123"
            value={formData.address}
            onChange={handleChange}
            required
          />
          
          <label className="block text-sm font-medium text-gray-700">Ubicación en Mapa</label>
          <LocationPicker 
            onLocationChange={handleLocationSelect}
            onAddressFound={handleAddressFound} // <-- 2. Conectar la nueva función
            initialPosition={{ lat: formData.latitude, lng: formData.longitude }}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitud (Auto-generada)"
              type="number"
              name="latitude"
              value={formData.latitude.toString()} // .toString() para el input
              onChange={handleChange}
              readOnly 
            />
            <Input
              label="Longitud (Auto-generada)"
              type="number"
              name="longitude"
              value={formData.longitude.toString()} // .toString() para el input
              onChange={handleChange}
              readOnly 
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={closeModals} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-md">
              {selectedLocation ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmar Eliminación */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeModals} title="Confirmar Eliminación">
        {/* ... (código del modal de borrado sin cambios) ... */}
         <div>
          <p className="mb-6">¿Estás seguro de que quieres eliminar la sucursal <strong>"{selectedLocation?.name}"</strong>?</p>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={closeModals} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
            <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md">Sí, Eliminar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}