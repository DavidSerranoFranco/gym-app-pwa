// frontend/src/pages/admin/AdminLocationsPage.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal';
import LocationForm from '../../components/admin/LocationForm';

interface Location {
  _id: string;
  name: string;
  address: string;
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error al obtener las sucursales:', error);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingLocation(null);
    fetchLocations();
  };

  const handleCreateClick = () => {
    setEditingLocation(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (location: Location) => {
    setEditingLocation(location);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingLocationId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingLocationId) return;
    try {
      await axios.delete(`http://localhost:5000/locations/${deletingLocationId}`);
      alert('Sucursal eliminada con éxito');
      fetchLocations();
    } catch (error) {
      console.error('Error al eliminar la sucursal:', error);
    } finally {
      setIsConfirmModalOpen(false);
      setDeletingLocationId(null);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestionar Sucursales</h1>
        <button onClick={handleCreateClick} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md">
          + Agregar Sucursal
        </button>
      </div>

      <table className="min-w-full bg-white">
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
                <button onClick={() => handleEditClick(location)} className="text-yellow-500 hover:text-yellow-700 mr-4">Editar</button>
                <button onClick={() => handleDeleteClick(location._id)} className="text-red-500 hover:text-red-700">Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingLocation ? 'Editar Sucursal' : 'Agregar Sucursal'}>
        <LocationForm initialData={editingLocation} onSuccess={handleFormSuccess} onClose={() => setIsFormModalOpen(false)} />
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirmar Eliminación">
        <div>
          <p className="mb-6">¿Estás seguro de que quieres eliminar esta sucursal?</p>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
            <button type="button" onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Sí, Eliminar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}