import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/mi-logo.png.jpg';

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y nombre */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-75 transition-smooth">
            <img src={logo} alt="Red UC Logo" className="h-10 rounded" />
            <span className="text-xl font-bold text-gray-800">Red UC</span>
          </Link>

          {/* Menú de navegación */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {currentUser ? (
              <>
                <Link
                  to="/favores"
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-smooth"
                >
                  Ver Favores
                </Link>
                <Link
                  to="/perfil"
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-smooth"
                >
                  Mi Perfil
                </Link>
                <span className="hidden sm:inline text-sm text-gray-600">
                  Hola, <span className="font-semibold text-gray-800">{currentUser.nombre.split(' ')[0]}</span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-smooth"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
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
