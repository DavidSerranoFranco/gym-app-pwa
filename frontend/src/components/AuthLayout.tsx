import React from 'react';
import { Link } from 'react-router-dom'; // Importar Link

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      
      {/* Columna Izquierda: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white">
        <div className="max-w-md w-full">
          
          {/* 1. Enlace "Volver al inicio" AÑADIDO */}
          <Link 
            to="/" 
            className="font-medium text-orange-600 hover:text-orange-500 mb-6 inline-block"
          >
            &larr; Volver al inicio
          </Link>

          {/* 2. Logo (convertido en un Link) */}
          <Link to="/" className="text-3xl font-extrabold text-gray-900 mb-6 block">
            GymApp
          </Link>

          {/* Título y Subtítulo */}
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 text-lg mb-8">{subtitle}</p>
          
          {/* Aquí se renderiza el formulario (Login o Register) */}
          {children} 
        </div>
      </div>

      {/* Columna Derecha: Decorativa (Simplificada y funcional) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-700 relative items-center justify-center p-12">
        <div className="text-white text-center">
          <h2 className="text-4xl font-extrabold mb-4">Tu transformación comienza aquí.</h2>
          <p className="text-lg opacity-90">
            Únete a la comunidad y alcanza tus metas. Un día a la vez.
          </p>
        </div>
        {/* Logo sutil en la esquina */}
        <span className="absolute bottom-8 right-8 text-white text-opacity-30 text-6xl font-extrabold select-none">
          GymApp
        </span>
      </div>
    </div>
  );
}