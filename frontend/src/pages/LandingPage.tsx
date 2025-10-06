// frontend/src/pages/LandingPage.tsx

import HeroSection from '../components/HeroSection';
import FeatureCard from '../components/FeatureCard';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    // Fondo principal de la página: un gris muy claro o blanco
    <div className="bg-gray-50 min-h-screen">
      
      {/* Barra de Navegación (Simple) */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-orange-500">Gym App</h1>
        <div>
          <Link to="/login" className="text-gray-600 hover:text-orange-500 font-semibold mr-4 transition-colors">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Sección Hero (Banner principal) */}
      <HeroSection />

      {/* Sección de Características */}
      <section className="py-20 px-4 md:px-8 text-center">
        <h2 className="text-4xl font-extrabold mb-4 text-gray-800">¿Por Qué Elegirnos?</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
          Te ofrecemos más que un lugar para entrenar. Somos una comunidad dedicada a tu bienestar y a ayudarte a superar tus límites.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon="💪"
            title="Entrenadores Expertos"
            description="Nuestro equipo de profesionales te guiará en cada paso, desde principiantes hasta atletas avanzados."
          />
          <FeatureCard
            icon="⏰"
            title="Reservas Flexibles"
            description="Controla tus horarios y asegura tu espacio con nuestro sistema de reservas online. ¡Sin aglomeraciones!"
          />
          <FeatureCard
            icon="🎯"
            title="Programas Personalizados"
            description="Diseñamos rutinas y planes nutricionales adaptados a tus objetivos y necesidades específicas."
          />
          <FeatureCard
            icon="🏆"
            title="Gana Puntos y Descuentos"
            description="Cada visita te acerca a recompensas. Acumula puntos y obtén descuentos exclusivos en tu membresía."
          />
          <FeatureCard
            icon="📱"
            title="App PWA Moderna"
            description="Accede a tu cuenta, historial y reservas desde cualquier dispositivo, como una app nativa."
          />
          <FeatureCard
            icon="⭐"
            title="Comunidad Activa"
            description="Únete a un ambiente motivador donde todos buscan la mejor versión de sí mismos."
          />
        </div>
      </section>

      {/* Sección de Call to Action (Registrarse) */}
      <section className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-20 px-4 md:px-8 text-center">
        <h2 className="text-4xl font-extrabold mb-6 text-white">¡No Esperes Más, Tu Mejor Versión Te Espera!</h2>
        <p className="text-xl mb-8 text-white max-w-3xl mx-auto">
          Regístrate hoy mismo y descubre todo lo que tenemos para ti.
        </p>
        <Link
          to="/register"
          className="bg-white text-orange-600 hover:bg-gray-200 font-bold py-3 px-10 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          ¡Quiero Unirme!
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Gym App. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}