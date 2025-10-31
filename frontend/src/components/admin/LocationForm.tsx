// frontend/src/components/admin/LocationForm.tsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../Input';

interface LocationData {
  _id?: string;
  name: string;
  address: string;
}

interface LocationFormProps {
  initialData?: LocationData | null;
  onSuccess: () => void;
  onClose: () => void;
}

export default function LocationForm({ initialData, onSuccess, onClose }: LocationFormProps) {
  const [formData, setFormData] = useState({ name: '', address: '' });
  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({ name: initialData.name, address: initialData.address });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.patch(`http://localhost:5000/locations/${initialData?._id}`, formData);
        alert('Sucursal actualizada con éxito');
      } else {
        await axios.post('http://localhost:5000/locations', formData);
        alert('Sucursal creada con éxito');
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar la sucursal:', error);
      alert('No se pudo guardar la sucursal.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Añadimos el placeholder que espera el componente Input */}
      <Input
        label="Nombre de la Sucursal"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Ej. Gimnasio Centro"
      />
      <Input
        label="Dirección"
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Ej. Av. Siempre Viva 123"
      />
      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
          {isEditMode ? 'Actualizar' : 'Guardar'} Sucursal
        </button>
      </div>
    </form>
  );
}