import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal'; // <-- VERIFICA ESTA RUTA
import ScheduleForm from '../../components/admin/ScheduleForm';

interface Location {
  _id: string;
  name: string;
}

interface Schedule {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
  location: Location;
}

const daysOfWeek: { [key: number]: string } = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo',
};

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  
  // CORRECCIÓN 1: El estado guardará el objeto Schedule completo o null.
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [schedulesRes, locationsRes] = await Promise.all([
        axios.get('http://localhost:5000/schedules'),
        axios.get('http://localhost:5000/locations'),
      ]);
      setSchedules(schedulesRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingSchedule(null);
    fetchData();
  };

  const handleCreateClick = () => {
    setEditingSchedule(null);
    setIsFormModalOpen(true);
  };

  // CORRECCIÓN 2: Simplemente guardamos el objeto schedule completo.
  const handleEditClick = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingScheduleId(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingScheduleId) return;
    try {
      await axios.delete(`http://localhost:5000/schedules/${deletingScheduleId}`);
      alert('Horario eliminado con éxito');
      fetchData();
    } catch (error) {
      console.error('Error al eliminar el horario:', error);
    } finally {
      setIsConfirmModalOpen(false);
      setDeletingScheduleId(null);
    }
  };

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const day = daysOfWeek[schedule.dayOfWeek];
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {} as { [key: string]: Schedule[] });

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestionar Horarios y Cupos</h1>
        <button
          onClick={handleCreateClick}
          disabled={locations.length === 0}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-400"
          title={locations.length === 0 ? "Primero debes crear una sucursal" : ""}
        >
          + Agregar Horario
        </button>
      </div>

      {locations.length === 0 && (
         <p className="text-center text-red-500 mb-4">No puedes agregar horarios porque no has creado ninguna sucursal. Ve a la sección de "Sucursales" para empezar.</p>
      )}

      <div className="space-y-6">
        {Object.keys(daysOfWeek).map(dayKey => {
          const dayName = daysOfWeek[Number(dayKey)];
          const daySchedules = groupedSchedules[dayName] || [];
          return (
            <div key={dayName}>
              <h2 className="text-xl font-semibold mb-2 border-b pb-2">{dayName}</h2>
              {daySchedules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {daySchedules.map(schedule => (
                    <div key={schedule._id} className="bg-gray-50 p-4 rounded-lg border flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-orange-600 mb-1">{schedule.location?.name || 'Sucursal no encontrada'}</p>
                        <p className="font-bold text-lg">{schedule.startTime} - {schedule.endTime}</p>
                        <p className="text-gray-600">Capacidad: {schedule.capacity} personas</p>
                      </div>
                      <div className="mt-4 flex space-x-2">
                         <button onClick={() => handleEditClick(schedule)} className="text-yellow-500 hover:text-yellow-700 text-sm">Editar</button>
                         <button onClick={() => handleDeleteClick(schedule._id)} className="text-red-500 hover:text-red-700 text-sm">Borrar</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (<p className="text-gray-500">No hay horarios definidos para este día.</p>)}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingSchedule(null);
        }}
        title={editingSchedule ? 'Editar Horario' : 'Agregar Nuevo Horario'}
      >
        <ScheduleForm 
          // CORRECCIÓN 3: Transformamos los datos justo aquí.
          initialData={editingSchedule ? { ...editingSchedule, location: editingSchedule.location._id } : null}
          locations={locations}
          onSuccess={handleFormSuccess}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingSchedule(null);
          }}
        />
      </Modal>
      
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirmar Eliminación">
          <div>
            <p className="mb-6">¿Estás seguro de que quieres eliminar este bloque de horario?</p>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
              <button type="button" onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Sí, Eliminar</button>
            </div>
          </div>
      </Modal>
    </div>
  );
}