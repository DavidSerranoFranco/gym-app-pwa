// frontend/src/components/AuthLayout.tsx

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: React.ReactNode; // Puede ser un string o un componente Link
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Columna Izquierda: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white z-10 relative">
        <div className="max-w-md w-full">
          <div className="text-left mb-8">
            {/* Aquí iría el logo, por ahora un placeholder */}
            <div className="h-8 w-auto mb-6">
              <span className="text-2xl font-bold text-gray-900">GymApp</span> 
              {/* Puedes reemplazar esto con una imagen de logo si tienes una */}
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600 text-lg">{subtitle}</p>
          </div>
          {children} {/* Aquí se renderizará el formulario de Login o Register */}
        </div>
      </div>

      {/* Columna Derecha: Ilustración (Fondo oscuro con montañas y cohete) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-black relative overflow-hidden items-center justify-center">
        {/* Contenedor para las montañas y el cohete */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Montañas naranjas/amarillas */}
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-orange-600 to-yellow-500 clip-mountains">
            {/* Puedes ajustar la clase clip-mountains en tu index.css para darle forma de montaña */}
          </div>

          {/* Cohete estilizado */}
          <div className="absolute bottom-1/4 animate-bounce-rocket"> 
            {/* Animación del cohete subiendo y bajando */}
            <img src="/rocket-icon.png" alt="Rocket" className="w-32 h-32" /> 
            {/* Reemplaza con una imagen de cohete real si tienes */}
          </div>

          {/* Estrellas o puntos de luz */}
          <div className="absolute inset-0 opacity-50">
            <div className="star star-1"></div>
            <div className="star star-2"></div>
            <div className="star star-3"></div>
            <div className="star star-4"></div>
            <div className="star star-5"></div>
          </div>

        </div>
        {/* Texto de fondo sutil si lo quieres */}
        <span className="absolute bottom-4 right-4 text-white text-opacity-10 text-9xl font-extrabold select-none pointer-events-none">GymApp</span>
      </div>
    </div>
  );
}