import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal'; 
import BookingConfirmationModal from '../components/BookingConfirmationModal';

// --- Interfaces ---
interface Location { _id: string; name: string; }
interface Schedule {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
  location: Location;
}

type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

// --- Componente Principal ---
export default function PublicSchedulesPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('http://localhost:5000/schedules');
        setAllSchedules(response.data);
      } catch (error) {
        console.error('Error al obtener los horarios:', error);
      }
    };
    fetchSchedules();
  }, []);

  const selectedDayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay(); 
  const availableSchedules = allSchedules.filter(
    (schedule) => schedule.dayOfWeek === selectedDayOfWeek
  );

  // --- CORRECCIÓN FINAL ---
  // Renombramos 'event' a '_event' para indicar que es un parámetro no utilizado
  const handleDateChange = (value: CalendarValue, _event: React.MouseEvent<HTMLButtonElement>) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleBookClick = (schedule: Schedule) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSchedule || !token) return;

    setIsLoading(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      await axios.post(
        'http://localhost:5000/bookings',
        {
          schedule: selectedSchedule._id,
          bookingDate: dateString,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      alert('¡Reserva confirmada con éxito!');
      setIsModalOpen(false);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const message = err.response?.data?.message || 'Error desconocido';
      console.error('Error al reservar:', message);
      alert(`Error al reservar: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // El JSX no cambia
  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">Reservar una Clase</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-md h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1. Elige una fecha</h2>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              minDate={new Date()}
              locale="es-ES"
            />
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              2. Elige un horario para el {selectedDate.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            
            {availableSchedules.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableSchedules.map(schedule => (
                  <div key={schedule._id} className="bg-gray-50 p-4 rounded-lg border text-center flex flex-col">
                    <p className="font-bold text-xs text-orange-600">{schedule.location.name}</p>
                    <p className="font-bold text-2xl my-2">{schedule.startTime}</p>
                    <p className="text-gray-500 text-sm">a</p>
                    <p className="font-bold text-lg">{schedule.endTime}</p>
                    <p className="text-gray-600 mt-2 text-sm">Capacidad: {schedule.capacity}</p>
                    <button 
                      onClick={() => handleBookClick(schedule)}
                      className="w-full mt-4 text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded-md transition-colors text-sm"
                    >
                      Reservar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay clases programadas para el día seleccionado.</p>
            )}
          </div>
        </div>
      </div>

      {selectedSchedule && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Confirmar Reserva"
        >
          <BookingConfirmationModal
            schedule={selectedSchedule}
            bookingDate={selectedDate}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleConfirmBooking}
            isLoading={isLoading}
          />
        </Modal>
      )}
    </div>
  );
}