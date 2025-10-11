import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      login(formData.correo, formData.password);
      navigate('/favores');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md border border-gray-200 p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
          <p className="text-gray-600 text-base">Bienvenido de vuelta a Red UC</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Correo */}
          <div>
            <label htmlFor="correo" className="block text-sm font-semibold text-gray-800 mb-2">
              Correo UC
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              required
              value={formData.correo}
              onChange={handleChange}
              placeholder="tunombre@uc.cl"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-smooth"
            />
          </div>

          {/* Botón de submit */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-smooth shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Ingresar
          </button>
        </form>

        {/* Enlace a registro */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-700 text-center">
            <span className="font-semibold">Demo:</span> Usa{' '}
            <code className="bg-white px-2 py-1 rounded text-xs border border-gray-300">mgonzalez@uc.cl</code>
            {' '}/{' '}
            <code className="bg-white px-2 py-1 rounded text-xs border border-gray-300">demo123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
