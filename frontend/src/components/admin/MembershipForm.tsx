import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Input from '../Input';

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

interface MembershipFormProps {
  onSuccess: () => void;
  onClose: () => void;
  existingMembership?: Membership | null;
}

export default function MembershipForm({ onSuccess, onClose, existingMembership }: MembershipFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    durationDays: 30,
    classesPerWeek: 0,
    totalClasses: 0,
    points: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingMembership) {
      setFormData({
        name: existingMembership.name,
        price: existingMembership.price,
        description: existingMembership.description || '',
        durationDays: existingMembership.durationDays,
        classesPerWeek: existingMembership.classesPerWeek,
        totalClasses: existingMembership.totalClasses,
        points: existingMembership.points,
      });
    } else {
      // Resetear a valores por defecto si es modo "Crear"
      setFormData({
        name: '',
        price: 0,
        description: '',
        durationDays: 30,
        classesPerWeek: 0,
        totalClasses: 0,
        points: 0,
      });
    }
  }, [existingMembership]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No estás autenticado.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (existingMembership) {
        await axios.patch(
          `http://localhost:5000/memberships/${existingMembership._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/memberships',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onSuccess();
    } catch (err) {
      const errorMsg = (err as any).response?.data?.message || 'Error al guardar la membresía.';
      setError(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre del Plan"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Ej. Plan Mensual"
        required
      />
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          placeholder="Describe brevemente este plan"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio (MXN)"
          type="number"
          name="price"
          value={formData.price.toString()}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
        <Input
          label="Duración (Días)"
          type="number"
          name="durationDays"
          value={formData.durationDays.toString()}
          onChange={handleChange}
          placeholder="Ej. 30"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Clases por Semana"
          type="number"
          name="classesPerWeek"
          value={formData.classesPerWeek.toString()}
          onChange={handleChange}
          placeholder="Ej. 3"
          required
        />
        <Input
          label="Clases Totales"
          type="number"
          name="totalClasses"
          value={formData.totalClasses.toString()}
          onChange={handleChange}
          placeholder="Ej. 12"
          required
        />
      </div>

      <Input
        label="Puntos Otorgados"
        type="number"
        name="points"
        value={formData.points.toString()}
        onChange={handleChange}
        placeholder="Ej. 50"
        required
      />
      
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="pt-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:bg-gray-300"
        >
          {isLoading ? 'Guardando...' : (existingMembership ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  );
}