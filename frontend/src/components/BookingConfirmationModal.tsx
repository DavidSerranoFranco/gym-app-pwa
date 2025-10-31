// Definimos las "props" que este componente espera recibir
interface BookingConfirmationModalProps {
  schedule: { // El horario seleccionado
    _id: string;
    startTime: string;
    endTime: string;
    location: { name: string };
  };
  bookingDate: Date; // La fecha seleccionada
  onClose: () => void; // Función para cerrar el modal
  onConfirm: () => void; // Función para confirmar la reserva
  isLoading: boolean; // Para mostrar un estado de carga
}

export default function BookingConfirmationModal({
  schedule,
  bookingDate,
  onClose,
  onConfirm,
  isLoading
}: BookingConfirmationModalProps) {

  // Formateamos la fecha para que se vea bonita, ej: "lunes, 3 de noviembre de 2025"
  const friendlyDate = bookingDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Confirmar Reserva</h2>
      <p className="text-lg mb-2">
        Estás a punto de reservar tu lugar para:
      </p>
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <p className="text-xl font-semibold">{schedule.location.name}</p>
        <p className="text-lg">{friendlyDate}</p>
        <p className="text-lg">{schedule.startTime} - {schedule.endTime}</p>
      </div>
      <p className="mb-6">Se descontará 1 clase de tu membresía activa. ¿Estás seguro?</p>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300"
        >
          {isLoading ? 'Reservando...' : 'Sí, Confirmar'}
        </button>
      </div>
    </div>
  );
}