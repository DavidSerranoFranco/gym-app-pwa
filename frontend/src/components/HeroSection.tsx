// frontend/src/components/HeroSection.tsx

import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section
      className="relative h-[600px] flex items-center justify-center text-center p-4"
      style={{
        backgroundImage: 'url(https://source.unsplash.com/1600x900/?gym,fitness,workout)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Capa blanca semitransparente para que el texto oscuro resalte */}
      <div className="absolute inset-0 bg-white opacity-40"></div>
      <div className="relative z-10 max-w-3xl text-gray-800">
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
          Transforma Tu Cuerpo, Transforma Tu Vida
        </h2>
        <p className="text-xl md:text-2xl mb-8">
          Únete a nuestra comunidad y alcanza tus metas de fitness con los mejores recursos y entrenadores.
        </p>
        <Link
          to="/register"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          ¡Comienza Hoy Mismo!
        </Link>
      </div>
    </section>
  );
}