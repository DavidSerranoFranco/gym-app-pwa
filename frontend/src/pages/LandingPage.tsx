import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos nuestro hook
import HeroSection from '../components/HeroSection'; // Asegúrate de tener estos componentes
import FeatureCard from '../components/FeatureCard'; // o coméntalos si no los tienes

export default function LandingPage() {
  // Obtenemos el usuario y la función de logout desde el contexto global
  const { user, logout } = useAuth();

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* Barra de Navegación Dinámica */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-2xl font-bold text-orange-500">Gym App</Link>
        <div className="flex items-center space-x-4">
          <Link to="/memberships" className="text-gray-600 hover:text-orange-500 font-semibold transition-colors">
            Membresías
          </Link>
          <Link to="/schedules" className="text-gray-600 hover:text-orange-500 font-semibold transition-colors">
            Horarios
          </Link>

          {/* --- LÓGICA CLAVE --- */}
          {user ? (
            // Si hay un usuario logueado, mostramos esto:
            <>
              <Link
                to={user.role === 'ADMIN' ? '/admin/memberships' : '/dashboard'}
                className="text-gray-600 hover:text-orange-500 font-semibold transition-colors"
              >
                Mi Panel
              </Link>
              <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
                Cerrar Sesión
              </button>
            </>
          ) : (
            // Si NO hay un usuario logueado, mostramos esto:
            <>
              <Link to="/login" className="text-gray-600 hover:text-orange-500 font-semibold transition-colors">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
                Regístrate
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* El resto de la página no necesita cambios */}
      <HeroSection />

      <section className="py-20 px-4 md:px-8 text-center">
        <h2 className="text-4xl font-extrabold mb-4 text-gray-800">¿Por Qué Elegirnos?</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
          Te ofrecemos más que un lugar para entrenar. Somos una comunidad dedicada a tu bienestar.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard icon="💪" title="Entrenadores Expertos" description="Nuestro equipo de profesionales te guiará en cada paso." />
          <FeatureCard icon="⏰" title="Reservas Flexibles" description="Controla tus horarios y asegura tu espacio con nuestro sistema online." />
          <FeatureCard icon="🎯" title="Programas Personalizados" description="Diseñamos rutinas y planes adaptados a tus objetivos." />
          <FeatureCard icon="🏆" title="Gana Puntos y Descuentos" description="Cada visita te acerca a recompensas y descuentos exclusivos." />
          <FeatureCard icon="📱" title="App PWA Moderna" description="Accede a tu cuenta desde cualquier dispositivo, como una app nativa." />
          <FeatureCard icon="⭐" title="Comunidad Activa" description="Únete a un ambiente motivador donde todos buscan su mejor versión." />
        </div>
      </section>

      <section className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-20 px-4 text-center">
        <h2 className="text-4xl font-extrabold mb-6 text-white">¡No Esperes Más, Tu Mejor Versión Te Espera!</h2>
        <Link
          to="/register"
          className="bg-white text-orange-600 hover:bg-gray-200 font-bold py-3 px-10 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all"
        >
          ¡Quiero Unirme!
        </Link>
      </section>

      <footer className="bg-white py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Gym App. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}