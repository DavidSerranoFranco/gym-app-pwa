// frontend/src/components/Input.tsx

import React from 'react';

interface InputProps {
  label: string;
  // CORRECCIÓN: Cambiamos 'type' para que sea un string genérico,
  // así aceptará "text", "password", "email", "number", etc.
  type: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: string; // Para inputs de tipo 'number'
}

export default function Input({ label, type, name, value, onChange, placeholder, min }: InputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
      />
    </div>
  );
}