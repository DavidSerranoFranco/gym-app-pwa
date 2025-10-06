// frontend/src/App.tsx

import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <Outlet /> {/* Aquí se renderizarán las páginas (Login, Register, etc.) */}
    </div>
  );
}