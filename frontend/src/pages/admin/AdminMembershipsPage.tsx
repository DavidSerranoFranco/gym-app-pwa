import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import MembershipForm from '../../components/admin/MembershipForm'; // <-- Usar el nuevo formulario

interface Membership {
  _id: string;
  name: string;
  price: number;
  description: string;
  durationDays: number;
  classesPerWeek: number;
  totalClasses: number;
  points: number;
}

export default function AdminMembershipsPage() {
  const { token } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);

  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/memberships');
      setMemberships(response.data);
    } catch (err) {
      setError('No se pudieron cargar las membresías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const openCreateModal = () => {
    setSelectedMembership(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedMembership(null);
  };

  const handleFormSuccess = () => {
    fetchMemberships();
    closeModals();
  };

  const handleDelete = async () => {
    if (!selectedMembership || !token) return;
    try {
      await axios.delete(`http://localhost:5000/memberships/${selectedMembership._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMemberships();
    } catch (err) {
      alert('Error al eliminar la membresía.');
    } finally {
      closeModals();
    }
  };

  if (loading) return <p>Cargando membresías...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Membresías</h1>
        <button
          onClick={openCreateModal}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md"
        >
          + Crear Membresía
        </button>
      </div>

      {/* --- TABLA ACTUALIZADA CON TODOS LOS CAMPOS --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Nombre</th>
              <th className="py-3 px-4 text-left">Precio</th>
              <th className="py-3 px-4 text-left">Duración (Días)</th>
              <th className="py-3 px-4 text-left">Clases (Semana)</th>
              <th className="py-3 px-4 text-left">Clases (Total)</th>
              <th className="py-3 px-4 text-left">Puntos</th>
              <th className="py-3 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((mem) => (
              <tr key={mem._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">{mem.name}</td>
                <td className="py-3 px-4">${mem.price.toFixed(2)}</td>
                <td className="py-3 px-4">{mem.durationDays}</td>
                <td className="py-3 px-4">{mem.classesPerWeek}</td>
                <td className="py-3 px-4">{mem.totalClasses}</td>
                <td className="py-3 px-4">{mem.points}</td>
                <td className="py-3 px-4 space-x-2">
                  <button
                    onClick={() => openEditModal(mem)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => openDeleteModal(mem)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE CREAR/EDITAR (USA EL NUEVO FORM) --- */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={closeModals} 
        title={selectedMembership ? "Editar Membresía" : "Crear Nueva Membresía"}
      >
        <MembershipForm
          onSuccess={handleFormSuccess}
          onClose={closeModals}
          existingMembership={selectedMembership}
        />
      </Modal>

      {/* --- MODAL DE CONFIRMACIÓN DE BORRADO --- */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeModals} title="Confirmar Eliminación">
        <div>
          <p>¿Estás seguro de que quieres eliminar la membresía <strong>"{selectedMembership?.name}"</strong>?</p>
          <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
          <div className="flex justify-end space-x-4 mt-6">
            <button onClick={closeModals} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">
              Cancelar
            </button>
            <button onClick={handleDelete} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}