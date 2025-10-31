import { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaz para que el componente sepa cómo es una sucursal
interface Location {
  _id: string;
  name: string;
}

interface ScheduleData {
  _id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
  location: string; // Guardará el ID de la sucursal
}

interface ScheduleFormProps {
  initialData?: Partial<ScheduleData> | null;
  locations: Location[]; // Recibirá la lista de sucursales
  onSuccess: () => void;
  onClose: () => void;
}

export default function ScheduleForm({ initialData, locations, onSuccess, onClose }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    capacity: 10,
    location: locations[0]?._id || '', // Valor inicial del dropdown
  });

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        dayOfWeek: initialData.dayOfWeek || 1,
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        capacity: initialData.capacity || 10,
        location: initialData.location || (locations[0]?._id || ''),
      });
    }
  }, [initialData, isEditMode, locations]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'dayOfWeek' || name === 'capacity' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.patch(`http://localhost:5000/schedules/${initialData?._id}`, formData);
        alert('Horario actualizado con éxito');
      } else {
        await axios.post('http://localhost:5000/schedules', formData);
        alert('Horario creado con éxito');
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar el horario:', error);
      alert('No se pudo guardar el horario. Asegúrate de seleccionar una sucursal.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* CAMPO NUEVO PARA SELECCIONAR SUCURSAL */}
      <div className="mb-4">
        <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">Sucursal</label>
        <select
          name="location"
          id="location"
          value={formData.location}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          required
        >
          <option value="" disabled>Selecciona una sucursal</option>
          {locations.map(loc => (
            <option key={loc._id} value={loc._id}>{loc.name}</option>
          ))}
        </select>
      </div>

      {/* El resto del formulario es igual */}
      <div className="mb-4">
        <label htmlFor="dayOfWeek" className="block text-gray-700 text-sm font-bold mb-2">Día de la Semana</label>
        <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
          <option value={1}>Lunes</option>
          <option value={2}>Martes</option>
          <option value={3}>Miércoles</option>
          <option value={4}>Jueves</option>
          <option value={5}>Viernes</option>
          <option value={6}>Sábado</option>
          <option value={7}>Domingo</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="startTime" className="block text-gray-700 text-sm font-bold mb-2">Hora de Inicio (HH:MM)</label>
        <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
      </div>
      <div className="mb-4">
        <label htmlFor="endTime" className="block text-gray-700 text-sm font-bold mb-2">Hora de Fin (HH:MM)</label>
        <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
      </div>
      <div className="mb-4">
        <label htmlFor="capacity" className="block text-gray-700 text-sm font-bold mb-2">Capacidad (personas)</label>
        <input type="number" name="capacity" min="1" value={formData.capacity} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
          {isEditMode ? 'Actualizar' : 'Guardar'} Horario
        </button>
      </div>
    </form>
  );
}