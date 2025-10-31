import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal';
import UserMembershipForm from '../../components/admin/UserMembershipForm';

interface UserMembership {
  _id: string;
  user: { name: string };
  membership: { name: string };
  endDate: string;
  classesRemaining: number;
  status: string;
}

export default function AdminUserMembershipsPage() {
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Estados para el modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);

  const fetchUserMemberships = async () => {
    try {
      const response = await axios.get('http://localhost:5000/user-memberships');
      setUserMemberships(response.data);
    } catch (error) {
      console.error('Error al obtener las suscripciones:', error);
    }
  };

  useEffect(() => {
    fetchUserMemberships();
  }, []);

  const handleSuccess = () => {
    setIsFormModalOpen(false);
    fetchUserMemberships();
  };

  // Abre el modal de confirmación
  const handleDeleteClick = (id: string) => {
    setDeletingSubId(id);
    setIsConfirmModalOpen(true);
  };

  // Confirma y ejecuta la eliminación
  const confirmDelete = async () => {
    if (!deletingSubId) return;
    try {
      await axios.delete(`http://localhost:5000/user-memberships/${deletingSubId}`);
      alert('Suscripción revocada con éxito');
      fetchUserMemberships();
    } catch (error) {
      console.error('Error al revocar la suscripción:', error);
      alert('No se pudo revocar la suscripción.');
    } finally {
      setIsConfirmModalOpen(false);
      setDeletingSubId(null);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Suscripciones de Usuarios</h1>
        <button onClick={() => setIsFormModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md">
          + Asignar Membresía
        </button>
      </div>

      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">Usuario</th>
            <th className="py-3 px-4 text-left">Plan</th>
            <th className="py-3 px-4 text-left">Clases Restantes</th>
            <th className="py-3 px-4 text-left">Vence el</th>
            <th className="py-3 px-4 text-left">Estado</th>
            <th className="py-3 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {userMemberships.map((sub) => (
            <tr key={sub._id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{sub.user?.name || 'Usuario no encontrado'}</td>
              <td className="py-3 px-4">{sub.membership?.name || 'Plan no encontrado'}</td>
              <td className="py-3 px-4">{sub.classesRemaining}</td>
              <td className="py-3 px-4">{new Date(sub.endDate).toLocaleDateString()}</td>
              <td className="py-3 px-4">{sub.status}</td>
              <td className="py-3 px-4">
                <button onClick={() => handleDeleteClick(sub._id)} className="text-red-500 hover:text-red-700">Revocar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title="Asignar Nueva Membresía">
        <UserMembershipForm onSuccess={handleSuccess} onClose={() => setIsFormModalOpen(false)} />
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirmar Revocación">
        <div>
          <p className="mb-6">¿Estás seguro de que quieres revocar esta suscripción?</p>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
            <button type="button" onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Sí, Revocar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}