import { useState, useEffect } from 'react';
import axios from 'axios';

interface User { _id: string; name: string; }
interface Membership { _id: string; name: string; }

interface UserMembershipFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function UserMembershipForm({ onSuccess, onClose }: UserMembershipFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedMembership, setSelectedMembership] = useState('');

  useEffect(() => {
    // Cargar usuarios y membresías al montar el componente
    const fetchData = async () => {
      const [usersRes, membershipsRes] = await Promise.all([
        axios.get('http://localhost:5000/auth/users'),
        axios.get('http://localhost:5000/memberships'),
      ]);
      setUsers(usersRes.data);
      setMemberships(membershipsRes.data);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser || !selectedMembership) {
      alert('Por favor, selecciona un usuario y una membresía.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/user-memberships', {
        user: selectedUser,
        membership: selectedMembership,
      });
      alert('Membresía asignada con éxito.');
      onSuccess();
    } catch (error) {
      console.error('Error al asignar la membresía:', error);
      alert('No se pudo asignar la membresía.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="user" className="block text-gray-700 font-bold mb-2">Usuario</label>
        <select id="user" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full p-2 border rounded">
          <option value="" disabled>Selecciona un usuario</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>{user.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="membership" className="block text-gray-700 font-bold mb-2">Membresía</label>
        <select id="membership" value={selectedMembership} onChange={(e) => setSelectedMembership(e.target.value)} className="w-full p-2 border rounded">
          <option value="" disabled>Selecciona una membresía</option>
          {memberships.map(mem => (
            <option key={mem._id} value={mem._id}>{mem.name}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md">Asignar Membresía</button>
      </div>
    </form>
  );
}