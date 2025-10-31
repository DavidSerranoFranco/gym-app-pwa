import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal';
import MembershipForm from '../../components/admin/MembershipForm';

// Interface actualizada para incluir classCount
interface Membership {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  classCount: number; // Campo añadido
  isActive: boolean;
}

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingMembershipId, setDeletingMembershipId] = useState<string | null>(null);

  const fetchMemberships = async () => {
    try {
      const response = await axios.get('http://localhost:5000/memberships');
      setMemberships(response.data);
    } catch (error) {
      console.error('Error al obtener las membresías:', error);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingMembership(null);
    fetchMemberships();
  };

  const handleEditClick = (membership: Membership) => {
    setEditingMembership(membership);
    setIsFormModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingMembership(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingMembershipId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingMembershipId) return;
    try {
      await axios.delete(`http://localhost:5000/memberships/${deletingMembershipId}`);
      alert('Membresía eliminada con éxito');
      fetchMemberships();
    } catch (error) {
      console.error('Error al eliminar la membresía:', error);
    } finally {
      setIsConfirmModalOpen(false);
      setDeletingMembershipId(null);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestionar Membresías</h1>
        <button
          onClick={handleCreateClick}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          + Crear Nueva
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Nombre</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Precio</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Duración (Días)</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Clases Incluidas</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Estado</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((membership) => (
              <tr key={membership._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{membership.name}</td>
                <td className="py-3 px-4">${membership.price.toFixed(2)}</td>
                <td className="py-3 px-4">{membership.durationInDays}</td>
                <td className="py-3 px-4">{membership.classCount}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      membership.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {membership.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => handleEditClick(membership)} className="text-yellow-500 hover:text-yellow-700 mr-4">Editar</button>
                  <button onClick={() => handleDeleteClick(membership._id)} className="text-red-500 hover:text-red-700">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingMembership ? 'Editar Membresía' : 'Crear Nueva Membresía'}
      >
        <MembershipForm
          initialData={editingMembership}
          onSuccess={handleFormSuccess}
          onClose={() => setIsFormModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <div>
          <p className="mb-6">¿Estás seguro de que quieres eliminar esta membresía?</p>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="button" onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Sí, Eliminar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}