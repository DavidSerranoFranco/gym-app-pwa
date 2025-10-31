import { useState, useEffect } from 'react';
import axios from 'axios';
import Input from '../Input';

interface MembershipData {
  _id?: string;
  name: string;
  price: number;
  durationInDays: number;
  classCount: number; // <-- Añadido
}

interface MembershipFormProps {
  initialData?: Partial<MembershipData> | null;
  onSuccess: () => void;
  onClose: () => void;
}

export default function MembershipForm({ initialData, onSuccess, onClose }: MembershipFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    durationInDays: 30,
    classCount: 8, // <-- Añadido
  });

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price || 0,
        durationInDays: initialData.durationInDays || 30,
        classCount: initialData.classCount || 8, // <-- Añadido
      });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      // Convertimos a número los campos que lo necesitan
      [name]: ['price', 'durationInDays', 'classCount'].includes(name) ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.patch(`http://localhost:5000/memberships/${initialData?._id}`, formData);
        alert('Membresía actualizada con éxito');
      } else {
        await axios.post('http://localhost:5000/memberships', formData);
        alert('Membresía creada con éxito');
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar la membresía:', error);
      alert('No se pudo guardar la membresía.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Nombre del Plan" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ej. Plan Mensual" />
      <Input label="Precio ($)" type="number" name="price" value={String(formData.price)} onChange={handleChange} placeholder="Ej. 500" />
      <Input label="Duración (días)" type="number" name="durationInDays" value={String(formData.durationInDays)} onChange={handleChange} placeholder="Ej. 30" />
      {/* --- NUEVO CAMPO EN EL FORMULARIO --- */}
      <Input label="Número de Clases" type="number" name="classCount" value={String(formData.classCount)} onChange={handleChange} placeholder="Ej. 8" />
      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
          {isEditMode ? 'Actualizar' : 'Guardar'} Membresía
        </button>
      </div>
    </form>
  );
}