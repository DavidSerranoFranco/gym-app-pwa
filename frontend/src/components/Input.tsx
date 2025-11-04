import { useState } from 'react'; // <-- 'type ChangeEvent' se ha eliminado

// 1. Definir los tipos que SIEMPRE queremos (label)
interface CustomProps {
  label: string;
}

// 2. Extender TODAS las propiedades de un <input> HTML normal
//    Esto incluye 'type', 'name', 'value', 'onChange', 'placeholder' (opcional), 
//    'readOnly', 'disabled', 'required', 'min', 'max', etc.
type InputProps = CustomProps & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ label, ...rest }: InputProps) {
  // 3. Estado interno para manejar la visibilidad
  const [showPassword, setShowPassword] = useState(false);

  // 4. Determinar el tipo de input a mostrar
  //    Usamos 'rest.type' que viene de las propiedades extendidas
  const inputType = rest.type === 'password' && showPassword ? 'text' : rest.type;

  // 5. Función para cambiar la visibilidad
  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputId = rest.id || rest.name;

  return (
    <div>
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      
      {/* 6. Contenedor relativo para posicionar el icono */}
      <div className="relative mt-1">
        <input
          {...rest} // Pasar todas las propiedades (name, value, onChange, readOnly, etc.)
          type={inputType} // Usar el tipo dinámico
          id={inputId}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 read-only:bg-gray-100"
        />
        
        {/* 7. Botón de Ojo (solo si el tipo original es 'password') */}
        {rest.type === 'password' && (
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              // Icono de Ojo Abierto (Tachado)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              // Icono de Ojo Cerrado (Normal)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}