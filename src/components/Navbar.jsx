import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/mi-logo.png.jpg';

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-uc-blue text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-smooth">
            <img src={logo} alt="Red UC Logo" className="h-10 rounded" />
            <span className="text-xl font-bold">Red UC</span>
          </Link>

          {/* Menú de navegación */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link
                  to="/favores"
                  className="px-4 py-2 rounded-lg hover:bg-uc-blue-light transition-smooth"
                >
                  Ver Favores
                </Link>
                <Link
                  to="/perfil"
                  className="px-4 py-2 rounded-lg hover:bg-uc-blue-light transition-smooth"
                >
                  Mi Perfil
                </Link>
                <span className="text-sm">
                  Hola, <span className="font-semibold">{currentUser.nombre.split(' ')[0]}</span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-white text-uc-blue rounded-lg font-semibold hover:bg-gray-100 transition-smooth"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg hover:bg-uc-blue-light transition-smooth"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="px-4 py-2 bg-mint text-white rounded-lg font-semibold hover:bg-mint-light transition-smooth"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
